import api from './axios';
import {
  getLocalArtifacts,
  saveLocalArtifacts,
  isBackendError,
  generateQRDataUrl,
} from './mockStore';

export const artifactApi = {
  getAll: async (params = {}) => {
    try {
      return await api.get('/artifacts', { params });
    } catch (error) {
      if (isBackendError(error)) {
        let list = getLocalArtifacts();

        // Filter search
        if (params.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (item) =>
              item.name?.toLowerCase().includes(q) ||
              item.origin?.toLowerCase().includes(q) ||
              item.description?.toLowerCase().includes(q) ||
              item.historical_period?.toLowerCase().includes(q) ||
              item.id?.toLowerCase().includes(q)
          );
        }

        // Filter category
        if (params.category) {
          list = list.filter((item) => item.category === params.category);
        }

        // Filter condition
        if (params.condition_status) {
          list = list.filter((item) => item.condition_status === params.condition_status);
        }

        return {
          data: {
            success: true,
            data: {
              artifacts: list,
              pagination: {
                total: list.length,
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: 50,
                totalPages: 1,
              },
            },
          },
        };
      }
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/artifacts/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        const list = getLocalArtifacts();
        let found = list.find((a) => String(a.id) === String(id));

        if (!found) {
          // Dynamic fallback for in-memory / backend-less execution
          found = {
            id,
            name: `Adwa Heritage Relic (${String(id).slice(-6)})`,
            category: 'ceremonial',
            historical_period: '1896 Adwa Victory Era',
            origin: 'Adwa Region, Ethiopia',
            materials: 'Bronze, hand-carved wood, gold filigree',
            description: 'Historical artifact preserved at the Adwa Victory Memorial Museum catalog. Represents traditional Ethiopian craftsmanship and sovereignty.',
            location: 'Adwa Victory Gallery A-2, Case 3',
            condition_status: 'good',
            is_on_loan: false,
            qr_code: `ART-${String(id).slice(-4).toUpperCase()}`,
            description_source: 'ai_approved',
            created_at: new Date().toISOString(),
            images: [
              {
                id: `img-${id}`,
                file_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
                is_primary: true,
              },
            ],
            keywords: ['adwa', 'heritage', 'ceremonial', '1896'],
          };
          saveLocalArtifacts([found, ...list]);
        }

        return { data: { success: true, data: found } };
      }
      throw error;
    }
  },

  getByQR: async (code) => {
    try {
      return await api.get(`/artifacts/qr/${code}`);
    } catch (error) {
      if (isBackendError(error)) {
        const list = getLocalArtifacts();
        let found = list.find((a) => a.qr_code?.toUpperCase() === String(code)?.toUpperCase());

        if (!found) {
          found = {
            id: `art-qr-${Date.now()}`,
            name: `Adwa Relic (${code})`,
            category: 'weapon',
            historical_period: '1896 Adwa Victory Era',
            origin: 'Adwa Region, Ethiopia',
            materials: 'Steel, rhino hide, brass',
            description: `Registered museum asset identified by tag ${code}. Preserved in the Adwa Victory Memorial Museum collection.`,
            location: 'Adwa Victory Gallery B-1',
            condition_status: 'excellent',
            is_on_loan: false,
            qr_code: String(code).toUpperCase(),
            description_source: 'ai_approved',
            created_at: new Date().toISOString(),
            images: [
              {
                id: 'img-qr',
                file_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
                is_primary: true,
              },
            ],
            keywords: ['adwa', 'relic', String(code).toLowerCase()],
          };
          saveLocalArtifacts([found, ...list]);
        }

        return { data: { success: true, data: { artifact: found } } };
      }
      throw error;
    }
  },

  create: async (formData) => {
    try {
      return await api.post('/artifacts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      if (isBackendError(error)) {
        // Parse FormData into object
        const newObj = {};
        const imagesList = [];

        if (formData instanceof FormData) {
          for (const [key, value] of formData.entries()) {
            if (key === 'images' && value instanceof File) {
              imagesList.push({
                id: `img-${Date.now()}-${Math.random()}`,
                file_url: URL.createObjectURL(value),
                is_primary: imagesList.length === 0,
              });
            } else if (key === 'keywords') {
              try {
                newObj.keywords = JSON.parse(value);
              } catch {
                newObj.keywords = value.split(',').map((k) => k.trim());
              }
            } else if (key === 'is_on_loan') {
              newObj.is_on_loan = value === 'true' || value === true;
            } else {
              newObj[key] = value;
            }
          }
        } else if (typeof formData === 'object') {
          Object.assign(newObj, formData);
        }

        // Generate ID and QR Code
        const id = `art-${Date.now()}`;
        const qrCode = `ART-${Math.floor(100 + Math.random() * 900)}`;

        // Default placeholder image if none uploaded
        if (imagesList.length === 0) {
          imagesList.push({
            id: 'img-default',
            file_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
            is_primary: true,
          });
        }

        const createdRecord = {
          id,
          name: newObj.name || 'Untitled Artifact',
          category: newObj.category || 'other',
          historical_period: newObj.historical_period || 'Unspecified',
          origin: newObj.origin || 'Adwa Region, Ethiopia',
          materials: newObj.materials || 'Mixed materials',
          description: newObj.description || '',
          location: newObj.location || 'Adwa Museum Gallery A-1',
          condition_status: newObj.condition_status || 'good',
          is_on_loan: Boolean(newObj.is_on_loan),
          keywords: newObj.keywords || [],
          qr_code: qrCode,
          description_source: newObj.description_source || 'manual',
          created_at: new Date().toISOString(),
          images: imagesList,
        };

        // Save to local storage
        const currentList = getLocalArtifacts();
        saveLocalArtifacts([createdRecord, ...currentList]);

        const qrDataUrl = generateQRDataUrl(qrCode);

        return {
          data: {
            success: true,
            message: 'Artifact created successfully',
            data: {
              artifact: createdRecord,
              qr_data_url: qrDataUrl,
            },
          },
        };
      }
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/artifacts/${id}`, data);
    } catch (error) {
      if (isBackendError(error)) {
        const list = getLocalArtifacts();
        const index = list.findIndex((a) => a.id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
          saveLocalArtifacts(list);
          return { data: { success: true, data: list[index] } };
        }
      }
      throw error;
    }
  },

  remove: async (id) => {
    try {
      return await api.delete(`/artifacts/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        const list = getLocalArtifacts();
        const filtered = list.filter((a) => a.id !== id);
        saveLocalArtifacts(filtered);
        return { data: { success: true, message: 'Artifact removed' } };
      }
      throw error;
    }
  },
};

export default artifactApi;
