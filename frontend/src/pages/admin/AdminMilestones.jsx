import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaBuilding,
  FaCalendarAlt,
  FaCertificate,
  FaEdit,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaIdCard,
  FaPlus,
  FaSort,
  FaTag,
  FaTrash,
  FaTrophy,
  FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import FormField from '../../components/FormField';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FileUploader from '../../components/FileUploader';

const SECTION_ORDER = ['education', 'activities', 'achievements', 'certifications'];

const SECTION_CONFIG = {
  education: {
    label: 'Education',
    singular: 'Education',
    icon: FaGraduationCap,
    listMethod: 'getEducation',
    createMethod: 'createEducation',
    updateMethod: 'updateEducation',
    deleteMethod: 'deleteEducation',
    empty: {
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      grade: '',
      description: '',
      order: 0,
    },
  },
  activities: {
    label: 'Activities',
    singular: 'Activity',
    icon: FaUsers,
    listMethod: 'getActivities',
    createMethod: 'createActivity',
    updateMethod: 'updateActivity',
    deleteMethod: 'deleteActivity',
    empty: {
      title: '',
      organization: '',
      role: '',
      start_date: '',
      end_date: '',
      is_current: false,
      highlights: [],
      description: '',
      order: 0,
    },
  },
  achievements: {
    label: 'Achievements',
    singular: 'Achievement',
    icon: FaTrophy,
    listMethod: 'getAchievements',
    createMethod: 'createAchievement',
    updateMethod: 'updateAchievement',
    deleteMethod: 'deleteAchievement',
    empty: {
      title: '',
      issuer: '',
      achieved_on: '',
      description: '',
      proof_url: '',
      order: 0,
    },
  },
  certifications: {
    label: 'Certifications',
    singular: 'Certification',
    icon: FaCertificate,
    listMethod: 'getCertifications',
    createMethod: 'createCertification',
    updateMethod: 'updateCertification',
    deleteMethod: 'deleteCertification',
    empty: {
      name: '',
      issuer: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
      skills: [],
      order: 0,
    },
  },
};

const toArray = (value) => (Array.isArray(value) ? value : []);
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getSortDate = (sectionKey, item) => {
  if (sectionKey === 'education' || sectionKey === 'activities') return new Date(item.start_date || 0).getTime();
  if (sectionKey === 'achievements') return new Date(item.achieved_on || 0).getTime();
  return new Date(item.issue_date || 0).getTime();
};

const formatMonthYear = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const formatPeriod = (startDate, endDate, isCurrent) => {
  const start = startDate ? formatMonthYear(startDate) : 'N/A';
  const end = isCurrent ? 'Present' : endDate ? formatMonthYear(endDate) : 'N/A';
  return `${start} - ${end}`;
};

export default function AdminMilestones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromQuery = searchParams.get('section');
  const activeSection = SECTION_ORDER.includes(sectionFromQuery) ? sectionFromQuery : 'education';

  const [records, setRecords] = useState({
    education: [],
    activities: [],
    achievements: [],
    certifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(SECTION_CONFIG.education.empty);
  const [arrayInput, setArrayInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentConfig = SECTION_CONFIG[activeSection];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        SECTION_ORDER.map(async (sectionKey) => {
          const response = await userApi[SECTION_CONFIG[sectionKey].listMethod]();
          const data = response.data?.results || response.data || [];
          return [sectionKey, toArray(data)];
        })
      );
      setRecords(Object.fromEntries(results));
    } catch {
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (sectionFromQuery === activeSection) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', activeSection);
    setSearchParams(nextParams, { replace: true });
  }, [activeSection, sectionFromQuery, searchParams, setSearchParams]);

  useEffect(() => {
    setShowForm(false);
    setEditingRecord(null);
    setFormData(SECTION_CONFIG[activeSection].empty);
    setArrayInput('');
  }, [activeSection]);

  const sortedItems = useMemo(() => {
    const current = toArray(records[activeSection]);
    return [...current].sort((a, b) => {
      const leftOrder = Number(a.order) || 0;
      const rightOrder = Number(b.order) || 0;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return getSortDate(activeSection, b) - getSortDate(activeSection, a);
    });
  }, [records, activeSection]);

  const selectSection = (sectionKey) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', sectionKey);
    setSearchParams(nextParams);
  };

  const openCreate = () => {
    setEditingRecord(null);
    setFormData(SECTION_CONFIG[activeSection].empty);
    setArrayInput('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingRecord(item);
    setFormData({ ...SECTION_CONFIG[activeSection].empty, ...item });
    setArrayInput('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    setFormData(SECTION_CONFIG[activeSection].empty);
    setArrayInput('');
    setIsSubmitting(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'order'
          ? Number(value) || 0
          : value,
    }));
  };

  const getArrayKey = () => (activeSection === 'activities' ? 'highlights' : 'skills');

  const addArrayItem = () => {
    const normalized = normalizeText(arrayInput);
    if (!normalized) return;
    const arrayKey = getArrayKey();
    setFormData((prev) => ({
      ...prev,
      [arrayKey]: [...toArray(prev[arrayKey]), normalized],
    }));
    setArrayInput('');
  };

  const removeArrayItem = (index) => {
    const arrayKey = getArrayKey();
    setFormData((prev) => ({
      ...prev,
      [arrayKey]: toArray(prev[arrayKey]).filter((_, idx) => idx !== index),
    }));
  };

  const buildPayload = () => {
    const basePayload = { ...formData, order: Number(formData.order) || 0 };

    if (activeSection === 'education') {
      return {
        ...basePayload,
        institution: normalizeText(basePayload.institution),
        degree: normalizeText(basePayload.degree),
        field_of_study: normalizeText(basePayload.field_of_study),
        grade: normalizeText(basePayload.grade),
        description: normalizeText(basePayload.description),
        end_date: basePayload.is_current ? null : (basePayload.end_date || null),
      };
    }

    if (activeSection === 'activities') {
      return {
        ...basePayload,
        title: normalizeText(basePayload.title),
        organization: normalizeText(basePayload.organization),
        role: normalizeText(basePayload.role),
        description: normalizeText(basePayload.description),
        highlights: toArray(basePayload.highlights).map(normalizeText).filter(Boolean),
        end_date: basePayload.is_current ? null : (basePayload.end_date || null),
      };
    }

    if (activeSection === 'achievements') {
      return {
        ...basePayload,
        title: normalizeText(basePayload.title),
        issuer: normalizeText(basePayload.issuer),
        description: normalizeText(basePayload.description),
        proof_url: normalizeText(basePayload.proof_url),
        achieved_on: basePayload.achieved_on || null,
      };
    }

    return {
      ...basePayload,
      name: normalizeText(basePayload.name),
      issuer: normalizeText(basePayload.issuer),
      credential_id: normalizeText(basePayload.credential_id),
      credential_url: normalizeText(basePayload.credential_url),
      issue_date: basePayload.issue_date || null,
      expiry_date: basePayload.expiry_date || null,
      skills: toArray(basePayload.skills).map(normalizeText).filter(Boolean),
    };
  };

  const isPayloadValid = (payload) => {
    if (activeSection === 'education') return payload.institution && payload.degree;
    if (activeSection === 'activities') return payload.title;
    if (activeSection === 'achievements') return payload.title;
    return payload.name;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPayload();
    if (!isPayloadValid(payload)) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await userApi[currentConfig.updateMethod](editingRecord.id, payload);
        toast.success(`${currentConfig.singular} updated`);
      } else {
        await userApi[currentConfig.createMethod](payload);
        toast.success(`${currentConfig.singular} created`);
      }
      await fetchAll();
      closeForm();
    } catch (error) {
      const errors = error.response?.data;
      const message = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : `Failed to save ${currentConfig.label.toLowerCase()}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${currentConfig.singular.toLowerCase()}?`)) return;
    try {
      await userApi[currentConfig.deleteMethod](id);
      toast.success(`${currentConfig.singular} deleted`);
      await fetchAll();
    } catch {
      toast.error(`Failed to delete ${currentConfig.label.toLowerCase()}`);
    }
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Milestones</h1>
          <p>Showcase education, extracurricular activities, achievements, and certifications.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> Add {currentConfig.singular}
        </button>
      </div>

      <div className="admin-milestones__tabs glass">
        {SECTION_ORDER.map((sectionKey) => {
          const sectionConfig = SECTION_CONFIG[sectionKey];
          const Icon = sectionConfig.icon;
          const isActive = sectionKey === activeSection;
          return (
            <button
              key={sectionKey}
              type="button"
              className={`admin-milestones__tab ${isActive ? 'admin-milestones__tab--active' : ''}`}
              onClick={() => selectSection(sectionKey)}
            >
              <Icon />
              <span>{sectionConfig.label}</span>
              <small>{toArray(records[sectionKey]).length}</small>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <Motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
          >
            <Motion.div
              className="admin-form-modal glass"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>{editingRecord ? `Edit ${currentConfig.singular}` : `New ${currentConfig.singular}`}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                {activeSection === 'education' && (
                  <>
                    <div className="admin-form__row">
                      <FormField label="Institution" name="institution" value={formData.institution} onChange={handleChange} icon={FaBuilding} required />
                      <FormField label="Degree" name="degree" value={formData.degree} onChange={handleChange} icon={FaGraduationCap} required />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Field of Study" name="field_of_study" value={formData.field_of_study} onChange={handleChange} icon={FaTag} />
                      <FormField label="Grade / GPA" name="grade" value={formData.grade} onChange={handleChange} icon={FaTrophy} />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Start Date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} icon={FaCalendarAlt} />
                      <FormField
                        label="End Date"
                        name="end_date"
                        type="date"
                        value={formData.end_date || ''}
                        onChange={handleChange}
                        icon={FaCalendarAlt}
                        disabled={formData.is_current}
                      />
                    </div>
                    <FormField label="Currently Studying" name="is_current" type="checkbox" value={formData.is_current} onChange={handleChange} />
                    <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} rows={4} />
                  </>
                )}

                {activeSection === 'activities' && (
                  <>
                    <div className="admin-form__row">
                      <FormField label="Activity Title" name="title" value={formData.title} onChange={handleChange} icon={FaUsers} required />
                      <FormField label="Organization" name="organization" value={formData.organization} onChange={handleChange} icon={FaBuilding} />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Role" name="role" value={formData.role} onChange={handleChange} icon={FaTag} />
                      <FormField label="Start Date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} icon={FaCalendarAlt} />
                    </div>
                    <div className="admin-form__row">
                      <FormField
                        label="End Date"
                        name="end_date"
                        type="date"
                        value={formData.end_date || ''}
                        onChange={handleChange}
                        icon={FaCalendarAlt}
                        disabled={formData.is_current}
                      />
                      <FormField label="Still Active" name="is_current" type="checkbox" value={formData.is_current} onChange={handleChange} />
                    </div>
                    <div className="admin-highlight-block">
                      <label className="form-label" htmlFor="activity-highlight-input">Highlights</label>
                      <div className="admin-highlight-input">
                        <input
                          id="activity-highlight-input"
                          className="form-input"
                          value={arrayInput}
                          onChange={(event) => setArrayInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addArrayItem();
                            }
                          }}
                          placeholder="Add highlight"
                        />
                        <button type="button" className="btn btn-outline btn-sm" onClick={addArrayItem}>Add</button>
                      </div>
                      {toArray(formData.highlights).length > 0 && (
                        <ul className="admin-highlight-list">
                          {toArray(formData.highlights).map((item, index) => (
                            <li key={`${item}-${index}`} className="admin-highlight-list__item">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeArrayItem(index)}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} rows={4} />
                  </>
                )}

                {activeSection === 'achievements' && (
                  <>
                    <div className="admin-form__row">
                      <FormField label="Title" name="title" value={formData.title} onChange={handleChange} icon={FaTrophy} required />
                      <FormField label="Issuer" name="issuer" value={formData.issuer} onChange={handleChange} icon={FaBuilding} />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Date" name="achieved_on" type="date" value={formData.achieved_on || ''} onChange={handleChange} icon={FaCalendarAlt} />
                      <FormField label="Proof URL" name="proof_url" value={formData.proof_url} onChange={handleChange} icon={FaExternalLinkAlt} />
                    </div>
                    <FileUploader
                      label="Upload Proof File"
                      accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      buttonText="Upload Proof"
                      onUploaded={(url) => setFormData((prev) => ({ ...prev, proof_url: url }))}
                    />
                    <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} rows={4} />
                  </>
                )}

                {activeSection === 'certifications' && (
                  <>
                    <div className="admin-form__row">
                      <FormField label="Certification Name" name="name" value={formData.name} onChange={handleChange} icon={FaCertificate} required />
                      <FormField label="Issuer" name="issuer" value={formData.issuer} onChange={handleChange} icon={FaBuilding} />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Issue Date" name="issue_date" type="date" value={formData.issue_date || ''} onChange={handleChange} icon={FaCalendarAlt} />
                      <FormField label="Expiry Date" name="expiry_date" type="date" value={formData.expiry_date || ''} onChange={handleChange} icon={FaCalendarAlt} />
                    </div>
                    <div className="admin-form__row">
                      <FormField label="Credential ID" name="credential_id" value={formData.credential_id} onChange={handleChange} icon={FaIdCard} />
                      <FormField label="Credential URL" name="credential_url" value={formData.credential_url} onChange={handleChange} icon={FaExternalLinkAlt} />
                    </div>
                    <FileUploader
                      label="Upload Credential File"
                      accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      buttonText="Upload Credential"
                      onUploaded={(url) => setFormData((prev) => ({ ...prev, credential_url: url }))}
                    />
                    <div className="admin-highlight-block">
                      <label className="form-label" htmlFor="cert-skill-input">Skills / Tags</label>
                      <div className="admin-highlight-input">
                        <input
                          id="cert-skill-input"
                          className="form-input"
                          value={arrayInput}
                          onChange={(event) => setArrayInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addArrayItem();
                            }
                          }}
                          placeholder="Add skill tag"
                        />
                        <button type="button" className="btn btn-outline btn-sm" onClick={addArrayItem}>Add</button>
                      </div>
                      {toArray(formData.skills).length > 0 && (
                        <ul className="admin-highlight-list">
                          {toArray(formData.skills).map((item, index) => (
                            <li key={`${item}-${index}`} className="admin-highlight-list__item">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeArrayItem(index)}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                <FormField
                  label="Display Order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  icon={FaSort}
                  hint="Lower appears first"
                />

                <div className="form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingRecord ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton variant="text" count={7} />
      ) : sortedItems.length === 0 ? (
        <div className="admin-panel__empty glass">
          <p>No {currentConfig.label.toLowerCase()} yet.</p>
        </div>
      ) : (
        <div className="admin-content-grid admin-milestones__grid">
          {sortedItems.map((item, index) => (
            <Motion.article
              key={`${activeSection}-${item.id}`}
              className="admin-content-card glass"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="admin-content-card__body">
                {activeSection === 'education' && (
                  <>
                    <h3>{item.degree}</h3>
                    <p className="admin-milestones__subtitle">{item.institution}</p>
                    <div className="admin-content-card__chips">
                      {item.field_of_study && <span className="chip">{item.field_of_study}</span>}
                      {item.grade && <span className="chip">Grade: {item.grade}</span>}
                    </div>
                    <div className="admin-content-card__meta">
                      <span><FaCalendarAlt /> {formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                      <span>Order: {Number(item.order) || 0}</span>
                    </div>
                    {item.description && <p className="admin-content-card__excerpt">{item.description}</p>}
                  </>
                )}

                {activeSection === 'activities' && (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-milestones__subtitle">
                      {[item.role, item.organization].filter(Boolean).join(' at ') || 'Extracurricular'}
                    </p>
                    <div className="admin-content-card__meta">
                      <span><FaCalendarAlt /> {formatPeriod(item.start_date, item.end_date, item.is_current)}</span>
                      <span>Order: {Number(item.order) || 0}</span>
                    </div>
                    {toArray(item.highlights).length > 0 && (
                      <div className="admin-content-card__chips">
                        {toArray(item.highlights).slice(0, 4).map((highlight, i) => (
                          <span key={`${highlight}-${i}`} className="chip">{highlight}</span>
                        ))}
                      </div>
                    )}
                    {item.description && <p className="admin-content-card__excerpt">{item.description}</p>}
                  </>
                )}

                {activeSection === 'achievements' && (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-milestones__subtitle">{item.issuer || 'Achievement'}</p>
                    <div className="admin-content-card__meta">
                      {item.achieved_on && <span><FaCalendarAlt /> {formatMonthYear(item.achieved_on)}</span>}
                      <span>Order: {Number(item.order) || 0}</span>
                    </div>
                    {item.description && <p className="admin-content-card__excerpt">{item.description}</p>}
                    {item.proof_url && (
                      <div className="admin-content-card__chips">
                        <a href={item.proof_url} target="_blank" rel="noopener noreferrer" className="chip">
                          <FaExternalLinkAlt /> Proof
                        </a>
                      </div>
                    )}
                  </>
                )}

                {activeSection === 'certifications' && (
                  <>
                    <h3>{item.name}</h3>
                    <p className="admin-milestones__subtitle">{item.issuer || 'Certification'}</p>
                    <div className="admin-content-card__meta">
                      <span><FaCalendarAlt /> {formatPeriod(item.issue_date, item.expiry_date, false)}</span>
                      <span>Order: {Number(item.order) || 0}</span>
                    </div>
                    <div className="admin-content-card__chips">
                      {item.credential_id && <span className="chip"><FaIdCard /> {item.credential_id}</span>}
                      {item.credential_url && (
                        <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="chip">
                          <FaExternalLinkAlt /> Verify
                        </a>
                      )}
                    </div>
                    {toArray(item.skills).length > 0 && (
                      <div className="admin-content-card__chips">
                        {toArray(item.skills).slice(0, 5).map((skill, i) => (
                          <span key={`${skill}-${i}`} className="chip">{skill}</span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="admin-content-card__actions">
                  <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEdit(item)}>
                    <FaEdit /> Edit
                  </button>
                  <button type="button" className="admin-btn admin-btn--delete" onClick={() => handleDelete(item.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
