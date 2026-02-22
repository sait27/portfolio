import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FaCode, FaEdit, FaFolderOpen, FaImage, FaPlus, FaSearch, FaSort, FaTag, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FormField from '../../components/FormField';
import SkillIcon from '../../components/SkillIcon';
import FileUploader from '../../components/FileUploader';

const EMPTY_CATEGORY = { name: '', order: 0 };
const EMPTY_SKILL = { name: '', icon: '', category: '', order: 0 };
const COMMON_SKILL_NAMES = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'Django',
  'Flask',
  'FastAPI',
  'Python',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Redux',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'GraphQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'Git',
  'GitHub',
  'Linux',
];

export default function AdminSkills() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY);

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, skillRes] = await Promise.all([userApi.getCategories(), userApi.getSkills()]);
      const catData = catRes.data?.results || catRes.data || [];
      const skillData = skillRes.data?.results || skillRes.data || [];
      setCategories(Array.isArray(catData) ? catData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    } catch {
      toast.error('Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategoryCards = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const orderedCategories = [...categories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return orderedCategories
      .map((category) => {
        const categorySkills = skills
          .filter((skill) => String(skill.category) === String(category.id))
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        if (!term) return { ...category, skills: categorySkills };

        const categoryMatch = category.name?.toLowerCase().includes(term);
        const filteredSkills = categorySkills.filter((skill) =>
          [skill.name, skill.icon].filter(Boolean).some((value) => String(value).toLowerCase().includes(term))
        );

        if (!categoryMatch && filteredSkills.length === 0) return null;
        return { ...category, skills: categoryMatch ? categorySkills : filteredSkills };
      })
      .filter(Boolean);
  }, [categories, skills, searchTerm]);

  const skillNameSuggestions = useMemo(() => {
    const existingSkillNames = skills
      .map((item) => item?.name)
      .filter((name) => typeof name === 'string' && name.trim().length > 0)
      .map((name) => name.trim());
    const uniqueNames = Array.from(new Set([...COMMON_SKILL_NAMES, ...existingSkillNames]));
    const term = skillForm.name.trim().toLowerCase();
    if (term.length < 2) return [];
    return uniqueNames
      .filter((name) => name.toLowerCase().includes(term))
      .filter((name) => name.toLowerCase() !== term)
      .slice(0, 8);
  }, [skillForm.name, skills]);

  const shouldShowSkillSuggestions = skillForm.name.trim().length >= 2;

  const openCatCreate = () => {
    setEditingCat(null);
    setCatForm(EMPTY_CATEGORY);
    setShowCatForm(true);
  };

  const openCatEdit = (category) => {
    setEditingCat(category);
    setCatForm({
      name: category.name || '',
      order: Number(category.order) || 0,
    });
    setShowCatForm(true);
  };

  const closeCatForm = () => {
    setShowCatForm(false);
    setEditingCat(null);
    setCatForm(EMPTY_CATEGORY);
    setIsSubmitting(false);
  };

  const openSkillCreate = (categoryId) => {
    setEditingSkill(null);
    setSkillForm({ ...EMPTY_SKILL, category: categoryId || '' });
    setShowSkillForm(true);
  };

  const openSkillEdit = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name || '',
      icon: skill.icon || '',
      category: skill.category || '',
      order: Number(skill.order) || 0,
    });
    setShowSkillForm(true);
  };

  const closeSkillForm = () => {
    setShowSkillForm(false);
    setEditingSkill(null);
    setSkillForm(EMPTY_SKILL);
    setIsSubmitting(false);
  };

  const handleCatSubmit = async (event) => {
    event.preventDefault();
    const name = catForm.name.trim();
    if (!name) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    const payload = { name, order: Number(catForm.order) || 0 };
    try {
      if (editingCat) {
        await userApi.updateCategory(editingCat.id, payload);
        toast.success('Category updated');
      } else {
        await userApi.createCategory(payload);
        toast.success('Category created');
      }
      await fetchData();
      closeCatForm();
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillSubmit = async (event) => {
    event.preventDefault();
    const name = skillForm.name.trim();
    if (!name) {
      toast.error('Skill name is required');
      return;
    }
    if (!skillForm.category) {
      toast.error('Choose a category');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name,
      icon: skillForm.icon.trim(),
      category: skillForm.category,
      order: Number(skillForm.order) || 0,
    };
    try {
      if (editingSkill) {
        await userApi.updateSkill(editingSkill.id, payload);
        toast.success('Skill updated');
      } else {
        await userApi.createSkill(payload);
        toast.success('Skill created');
      }
      await fetchData();
      closeSkillForm();
    } catch (error) {
      const raw = error.response?.data;
      const message = typeof raw === 'object' ? Object.values(raw).flat().join(', ') : 'Failed to save skill';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and its skills?')) return;
    try {
      await userApi.deleteCategory(id);
      toast.success('Category deleted');
      await fetchData();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await userApi.deleteSkill(id);
      toast.success('Skill deleted');
      await fetchData();
    } catch {
      toast.error('Failed to delete skill');
    }
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Skills & Categories</h1>
          <p>Organize your stack with clear categories and ordering.</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={openCatCreate}>
            <FaFolderOpen /> New Category
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openSkillCreate('')}>
            <FaPlus /> New Skill
          </button>
        </div>
      </div>

      <div className="admin-content-toolbar glass">
        <label className="admin-panel__search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search categories and skills"
            aria-label="Search categories and skills"
          />
        </label>
      </div>

      <AnimatePresence>
        {showCatForm && (
          <Motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCatForm}
          >
            <Motion.div
              className="admin-form-modal glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>{editingCat ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleCatSubmit} className="admin-form">
                <FormField
                  label="Category Name"
                  name="name"
                  value={catForm.name}
                  onChange={(event) => setCatForm((prev) => ({ ...prev, name: event.target.value }))}
                  icon={FaTag}
                  required
                />
                <FormField
                  label="Display Order"
                  name="order"
                  type="number"
                  value={catForm.order}
                  onChange={(event) =>
                    setCatForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))
                  }
                  icon={FaSort}
                />
                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeCatForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkillForm && (
          <Motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSkillForm}
          >
            <Motion.div
              className="admin-form-modal glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>{editingSkill ? 'Edit Skill' : 'New Skill'}</h2>
              <form onSubmit={handleSkillSubmit} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-skill-name-picker">
                    <FormField
                      label="Skill Name"
                      name="name"
                      value={skillForm.name}
                      onChange={(event) => setSkillForm((prev) => ({ ...prev, name: event.target.value }))}
                      icon={FaCode}
                      hint="Type at least 2 letters to see suggestions"
                      autoComplete="off"
                      required
                    />
                    {shouldShowSkillSuggestions && (
                      <div className="admin-skill-suggestions glass" role="listbox" aria-label="Skill suggestions">
                        {skillNameSuggestions.length > 0 ? (
                          skillNameSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="admin-skill-suggestions__item"
                              onClick={() => setSkillForm((prev) => ({ ...prev, name: suggestion }))}
                            >
                              <SkillIcon
                                name={suggestion}
                                className="admin-skill-suggestions__icon"
                                fallbackClassName="admin-skill-suggestions__icon--fallback"
                              />
                              <span>{suggestion}</span>
                            </button>
                          ))
                        ) : (
                          <div className="admin-skill-suggestions__empty">No suggestions found</div>
                        )}
                      </div>
                    )}
                  </div>
                  <FormField
                    label="Category"
                    name="category"
                    type="select"
                    value={skillForm.category}
                    onChange={(event) => setSkillForm((prev) => ({ ...prev, category: event.target.value }))}
                    icon={FaTag}
                    options={categories.map((category) => ({ value: category.id, label: category.name }))}
                    placeholder="Select category"
                    required
                  />
                </div>

                <div className="admin-form__row">
                  <FormField
                    label="Icon URL"
                    name="icon"
                    value={skillForm.icon}
                    onChange={(event) => setSkillForm((prev) => ({ ...prev, icon: event.target.value }))}
                    icon={FaImage}
                    hint="Optional image/SVG URL"
                  />
                  <FormField
                    label="Display Order"
                    name="order"
                    type="number"
                    value={skillForm.order}
                    onChange={(event) =>
                      setSkillForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))
                    }
                    icon={FaSort}
                  />
                </div>
                <FileUploader
                  label="Upload Skill Icon"
                  accept="image/*,.svg,image/svg+xml"
                  buttonText="Upload Icon"
                  onUploaded={(url) => setSkillForm((prev) => ({ ...prev, icon: url }))}
                />

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeSkillForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : filteredCategoryCards.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No categories or skills match your search.</p>
        </div>
      ) : (
        <div className="admin-skill-categories">
          {filteredCategoryCards.map((category, index) => (
            <Motion.article
              key={category.id}
              className="admin-skill-category glass"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="admin-skill-category__header">
                <div>
                  <h3 className="admin-skill-category__title">
                    <FaFolderOpen /> {category.name}
                  </h3>
                  <div className="admin-skill-category__meta">
                    <span className="chip">
                      <FaCode /> {category.skills.length} skill{category.skills.length === 1 ? '' : 's'}
                    </span>
                    <span className="chip">
                      <FaSort /> Order: {Number(category.order) || 0}
                    </span>
                  </div>
                </div>
                <div className="admin-actions">
                  <button type="button" className="admin-btn admin-btn--edit" onClick={() => openCatEdit(category)}>
                    <FaEdit /> Edit
                  </button>
                  <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDeleteCategory(category.id)}>
                    <FaTrash /> Delete
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openSkillCreate(category.id)}>
                    <FaPlus /> Add Skill
                  </button>
                </div>
              </div>

              {category.skills.length > 0 ? (
                <div className="admin-skill-list">
                  {category.skills.map((skill) => (
                    <div key={skill.id} className="admin-skill-item">
                      <div className="admin-skill-item__info">
                        <SkillIcon
                          name={skill.name}
                          iconUrl={skill.icon}
                          className="admin-skill-item__icon-fallback"
                        />
                        <div>
                          <p>{skill.name}</p>
                          <small><FaSort /> Order: {Number(skill.order) || 0}</small>
                        </div>
                      </div>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn--edit" onClick={() => openSkillEdit(skill)}>
                          <FaEdit />
                        </button>
                        <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDeleteSkill(skill.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-skill-category__empty">
                  <FaCode /> No skills in this category yet.
                </p>
              )}
            </Motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
