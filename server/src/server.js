import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createApp } from './app.js';
import { AreaGraph } from './engine/graph.js';
import { MatchingPipeline } from './engine/pipeline.js';
import { setMatchingPipeline } from './controllers/providerController.js';
import { ProviderProfile } from './models/ProviderProfile.js';
import { AreaGraphModel } from './models/AreaGraph.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

export const initializeEngine = async () => {
  const areaGraph = new AreaGraph();

  // Load graph nodes and edges from database
  const graphNodes = await AreaGraphModel.find();
  for (const node of graphNodes) {
    areaGraph.addNode(node.name, node.coordinates);
    for (const edge of node.edges) {
      areaGraph.addEdge(node.name, edge.to, edge.distanceKm);
    }
  }

  const pipeline = new MatchingPipeline(areaGraph);

  // Load all verified providers with user population
  const providers = await ProviderProfile.find()
    .populate('user', 'name phone email avatar neighbourhood status');

  const formattedProviders = providers.map((p) => {
    const obj = p.toObject();
    return {
      ...obj,
      name: p.user?.name || 'Local Technician',
      primaryArea: p.serviceAreas?.[0] || p.user?.neighbourhood || 'Sector 17, Chandigarh',
      status: p.user?.status || 'active',
    };
  });

  pipeline.populateProviders(formattedProviders);
  setMatchingPipeline(pipeline);

  console.log(`Matching engine initialized with ${graphNodes.length} route nodes and ${formattedProviders.length} providers.`);
  return pipeline;
};

export const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
};

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is required.');
      process.exit(1);
    }

    console.log(`Connecting to MongoDB database at ${maskMongoUri(MONGODB_URI)}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected to MongoDB database at ${maskMongoUri(MONGODB_URI)}`);

    // Initialize custom matching engine
    await initializeEngine();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`NearFix API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed. Ensure MongoDB is running and network access is permitted:', error.message || error);
    process.exit(1);
  }
};

import { fileURLToPath } from 'url';

export { startServer };

const isMain = process.argv[1] && fileURLToPath(import.meta.url).replace(/\\/g, '/') === process.argv[1].replace(/\\/g, '/');
if (isMain) {
  startServer();
}
