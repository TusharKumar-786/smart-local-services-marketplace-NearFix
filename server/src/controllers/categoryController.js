import { ServiceCategory } from '../models/ServiceCategory.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load categories' });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await ServiceCategory.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Service category not found' });
    }
    return res.json({ category });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve category' });
  }
};
