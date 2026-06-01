import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { useNotes } from '@/hooks/useNotes';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useLocation } from '@/hooks/useLocation';
import { api } from '@/services/api';
import type { Category, UpdateNoteInput } from '@/types/note';

export default function HomeScreen() {
  const { email, token } = useAuth();
  const { notes, loading, error, loadNotes, createNote, updateNote, deleteNote } = useNotes();
  const { imageUri, error: imageError, pickFromGallery, takePhoto, clearImage } = useImagePicker();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation, clearLocation } = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingNote, setEditingNote] = useState<{
    id: number; title: string; content: string; categoryId: number;
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number>(0);

  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const cat = await api.createCategory(name);
      setCategories((prev) => [...prev, cat]);
      setSelectedCategoryId(cat.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch {
      Alert.alert('Error', 'No se pudo crear la categoria');
    }
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Error', 'Titulo y contenido son obligatorios');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Selecciona una categoria');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl: string | undefined;

      if (imageUri) {
        const filename = imageUri.split('/').pop() ?? 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
        finalImageUrl = await api.uploadImage(imageUri, filename, mimeType);
      }

      await createNote({
        title: newTitle.trim(),
        content: newContent.trim(),
        categoryId: selectedCategoryId,
        imageUrl: finalImageUrl,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      setNewTitle('');
      setNewContent('');
      setSelectedCategoryId(null);
      clearImage();
      clearLocation();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear la nota';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (note: { id: number; title: string; content: string; categoryId: number }) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategoryId(note.categoryId);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;
    const data: UpdateNoteInput = {
      title: editTitle.trim(),
      content: editContent.trim(),
      categoryId: editCategoryId,
    };
    try {
      await updateNote(editingNote.id, data);
      setEditingNote(null);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la nota');
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingNoteId === null) return;
    try {
      await deleteNote(deletingNoteId);
    } catch {
      Alert.alert('Error', 'No se pudo eliminar la nota');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const name = email?.split('@')[0] ?? 'Usuario';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <View style={styles.screen}>
      <Text style={styles.welcome}>Bienvenido de vuelta, {displayName}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadNotes}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* CREATE FORM */}
          <View style={styles.createCard}>
            <TextInput
              style={styles.input}
              placeholder="Titulo de la nota"
              placeholderTextColor="#9CA3AF"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Contenido"
              placeholderTextColor="#9CA3AF"
              multiline
              value={newContent}
              onChangeText={setNewContent}
            />

            {/* Category picker */}
            <Pressable
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.categorySelectorText}>
                {selectedCategoryId
                  ? categories.find((c) => c.id === selectedCategoryId)?.name
                  : 'Seleccionar categoria'}
              </Text>
            </Pressable>

            {showCategoryPicker && (
              <View style={styles.categoryList}>
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        selectedCategoryId === cat.id && styles.categoryOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(cat.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryOptionText}>{cat.name}</Text>
                    </Pressable>
                  ))}
                {!showNewCategoryInput ? (
                  <Pressable
                    style={styles.addCategoryBtn}
                    onPress={() => setShowNewCategoryInput(true)}
                  >
                    <Text style={styles.addCategoryText}>+ Nueva categoria</Text>
                  </Pressable>
                ) : (
                  <View style={styles.newCategoryRow}>
                    <TextInput
                      style={styles.newCategoryInput}
                      placeholder="Nombre"
                      placeholderTextColor="#9CA3AF"
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      onSubmitEditing={handleCreateCategory}
                    />
                    <Pressable style={styles.saveCategoryBtn} onPress={handleCreateCategory}>
                      <Text style={styles.saveCategoryText}>Guardar</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* Image picker */}
            <View style={styles.imageRow}>
              <Pressable style={styles.imageBtn} onPress={takePhoto}>
                <Text style={styles.imageBtnText}>Tomar foto</Text>
              </Pressable>
              <Pressable style={styles.imageBtn} onPress={pickFromGallery}>
                <Text style={styles.imageBtnText}>Galeria</Text>
              </Pressable>
            </View>

            {imageError ? (
              <Text style={styles.permissionError}>{imageError}</Text>
            ) : imageUri ? (
              <View style={styles.previewRow}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
                <Pressable onPress={clearImage} style={styles.removeImageBtn}>
                  <Text style={styles.removeImageText}>Quitar</Text>
                </Pressable>
              </View>
            ) : null}

            {/* GPS */}
            {!location ? (
              <Pressable
                style={[styles.gpsBtn, locationLoading && styles.gpsBtnLoading]}
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Text style={styles.gpsBtnText}>
                  {locationLoading ? 'Obteniendo ubicacion...' : 'Registrar ubicacion'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>Ubicacion registrada</Text>
                <Pressable onPress={clearLocation}>
                  <Text style={styles.removeImageText}>Quitar</Text>
                </Pressable>
              </View>
            )}

            {locationError ? (
              <Text style={styles.permissionError}>{locationError}</Text>
            ) : null}

            <Pressable
              style={[styles.createBtn, isSaving && styles.createBtnDisabled]}
              onPress={handleCreateNote}
              disabled={isSaving}
            >
              <Text style={styles.createBtnText}>
                {isSaving ? 'Guardando...' : 'Crear nota'}
              </Text>
            </Pressable>
          </View>

          {/* NOTES LIST */}
          <Text style={styles.sectionTitle}>{notes.length} notas</Text>
          <FlatList
            data={notes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay notas aun. Crea la primera!</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                  {item.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category.name}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>

                {item.imageUrl ? (
                  <Pressable onPress={() => setFullScreenImage(item.imageUrl)}>
                    <View style={styles.noteImageContainer}>
                      <Image source={{ uri: item.imageUrl }} style={styles.noteImage} />
                      <View style={styles.viewFullOverlay}>
                        <Text style={styles.viewFullText}>Ver foto completa</Text>
                      </View>
                    </View>
                  </Pressable>
                ) : null}

                {(item.latitude != null && item.longitude != null) && (
                  <Text style={styles.noteLocation}>Ubicacion registrada</Text>
                )}

                <Text style={styles.noteDate}>
                  {new Date(item.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </Text>

                <View style={styles.noteActions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() => handleEdit({
                      id: item.id,
                      title: item.title,
                      content: item.content,
                      categoryId: item.categoryId,
                    })}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => setDeletingNoteId(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* EDIT MODAL */}
      <Modal visible={!!editingNote} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar nota</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Titulo"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Contenido"
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <Text style={styles.modalLabel}>Categoria</Text>
            <View style={styles.editCategoryRow}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.chip, editCategoryId === cat.id && styles.chipSelected]}
                  onPress={() => setEditCategoryId(cat.id)}
                >
                  <Text style={styles.chipText}>{cat.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditingNote(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE MODAL */}
      <Modal visible={deletingNoteId !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Estas seguro?</Text>
            <Text style={styles.deleteModalText}>Esta accion no se puede deshacer.</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeletingNoteId(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteBtn} onPress={handleConfirmDelete}>
                <Text style={styles.confirmDeleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN IMAGE MODAL */}
      <Modal visible={fullScreenImage !== null} animationType="fade" transparent>
        <View style={styles.fullscreenOverlay}>
          <Pressable style={styles.fullscreenClose} onPress={() => setFullScreenImage(null)}>
            <Text style={styles.fullscreenCloseText}>Cerrar</Text>
          </Pressable>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingTop: 12 },
  welcome: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 },
  center: { alignItems: 'center', marginTop: 40 },
  error: { color: '#DC2626', fontSize: 14, marginBottom: 8 },
  retryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  createCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2, gap: 10,
  },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111827',
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  categorySelector: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  categorySelectorText: { fontSize: 15, color: '#111827' },
  categoryList: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 8, backgroundColor: '#F9FAFB', gap: 4,
  },
  categoryOption: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  categoryOptionSelected: { backgroundColor: '#DBEAFE' },
  categoryOptionText: { fontSize: 14, color: '#111827' },
  addCategoryBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  addCategoryText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  newCategoryRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 4 },
  newCategoryInput: {
    flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: '#111827',
  },
  saveCategoryBtn: {
    backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  saveCategoryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  imageRow: { flexDirection: 'row', gap: 10 },
  imageBtn: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  imageBtnText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  permissionError: { color: '#DC2626', fontSize: 13 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preview: { width: 80, height: 60, borderRadius: 8 },
  removeImageBtn: { paddingVertical: 4 },
  removeImageText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  gpsBtn: {
    backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  gpsBtnLoading: { opacity: 0.6 },
  gpsBtnText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  locationText: { fontSize: 13, color: '#065F46', fontWeight: '500' },
  createBtn: {
    backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 24, fontSize: 14 },
  noteCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 6, elevation: 1, gap: 6,
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  categoryBadge: {
    backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, marginLeft: 8,
  },
  categoryBadgeText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  noteContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  noteImage: { width: '100%', height: 160, borderRadius: 8, marginTop: 4 },
  noteLocation: { fontSize: 12, color: '#059669', fontWeight: '500' },
  noteDate: { fontSize: 12, color: '#9CA3AF' },
  noteActions: { flexDirection: 'row', gap: 10 },
  editBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 400, gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  editCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipSelected: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  cancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  saveBtn: { backgroundColor: '#2563EB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  deleteModalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 320, gap: 8,
  },
  deleteModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  deleteModalText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  confirmDeleteBtn: { backgroundColor: '#DC2626', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  confirmDeleteText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  noteImageContainer: { position: 'relative' as const },
  viewFullOverlay: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewFullText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute' as const,
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  fullscreenCloseText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  fullscreenImage: { width: '100%', height: '80%' },
});
