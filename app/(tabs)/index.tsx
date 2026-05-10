import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/components/AuthContext';
import { api } from '@/services/api';
import type { Category, Note } from '@/types/note';

export default function HomeScreen() {
  const { user } = useAuth();
  const name = user?.name ?? 'Usuario';

  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const [notesData, categoriesData] = await Promise.all([
        api.getNotes(),
        api.getCategories(),
      ]);
      setNotes(notesData);
      setCategories(categoriesData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al cargar datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNote = async () => {
    const title = newTitle.trim();
    const content = newContent.trim();

    if (!title || !content || selectedCategoryId === null) {
      Alert.alert('Campos requeridos', 'Completa título, contenido y categoría.');
      return;
    }

    try {
      setIsSaving(true);
      const note = await api.createNote({
        title,
        content,
        categoryId: selectedCategoryId,
      });
      setNotes((prev) => [note, ...prev]);
      setNewTitle('');
      setNewContent('');
      setSelectedCategoryId(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error creando la nota.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      const category = await api.createCategory(name);
      setCategories((prev) => [...prev, category]);
      setSelectedCategoryId(category.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error creando categoría.');
    }
  };

  const handleDeleteNote = (id: number) => {
    setDeletingNoteId(id);
  };

  const confirmDeleteNote = async () => {
    if (deletingNoteId === null) return;
    try {
      await api.deleteNote(deletingNoteId);
      setNotes((prev) => prev.filter((n) => n.id !== deletingNoteId));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error eliminando nota.');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategoryId(note.categoryId);
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    const title = editTitle.trim();
    const content = editContent.trim();

    if (!title || !content || editCategoryId === null) {
      Alert.alert('Campos requeridos', 'Completa título, contenido y categoría.');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await api.updateNote(editingNote.id, {
        title,
        content,
        categoryId: editCategoryId,
      });
      setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
      setEditingNote(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error actualizando nota.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bienvenido de vuelta, {name}</Text>
      <Text style={styles.subtitle}>Organiza tus notas por categoría.</Text>

      <View style={styles.card}>
        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Título de la nota"
            placeholderTextColor="#6B7E95"
            style={styles.input}
          />
          <TextInput
            value={newContent}
            onChangeText={setNewContent}
            placeholder="Contenido de la nota"
            placeholderTextColor="#6B7E95"
            style={[styles.input, styles.contentInput]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Pressable
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            style={styles.categorySelector}>
            <Text style={selectedCategory ? styles.categorySelectorText : styles.categorySelectorPlaceholder}>
              {selectedCategory ? selectedCategory.name : 'Seleccionar categoría'}
            </Text>
            <Text style={styles.arrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
          </Pressable>

          {showCategoryPicker && (
            <View style={styles.categoryDropdown}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setShowCategoryPicker(false);
                  }}
                  style={[
                    styles.categoryOption,
                    selectedCategoryId === cat.id && styles.categoryOptionSelected,
                  ]}>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategoryId === cat.id && styles.categoryOptionTextSelected,
                    ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}

              {showNewCategoryInput ? (
                <View style={styles.newCategoryRow}>
                  <TextInput
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Nueva categoría"
                    placeholderTextColor="#6B7E95"
                    style={[styles.input, styles.newCategoryInput]}
                  />
                  <Pressable onPress={handleCreateCategory} style={styles.addCategoryButton}>
                    <Text style={styles.addCategoryButtonText}>OK</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowNewCategoryInput(true)}
                  style={styles.newCategoryLink}>
                  <Text style={styles.newCategoryLinkText}>+ Nueva categoría</Text>
                </Pressable>
              )}
            </View>
          )}

          <Pressable
            onPress={handleCreateNote}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              isSaving && styles.addButtonDisabled,
            ]}>
            <Text style={styles.addButtonText}>{isSaving ? 'Creando...' : 'Crear nota'}</Text>
          </Pressable>
        </ScrollView>

        <Text style={styles.counterText}>{notes.length} nota{notes.length !== 1 ? 's' : ''}</Text>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color="#1A4B8F" />
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes notas. ¡Crea la primera!</Text>}
            renderItem={({ item }) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <View style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                    {cat && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{cat.name}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
                  <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <View style={styles.noteActions}>
                    <Pressable onPress={() => openEditModal(item)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteNote(item.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <Modal visible={editingNote !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar nota</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título"
              placeholderTextColor="#6B7E95"
              style={styles.input}
            />
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Contenido"
              placeholderTextColor="#6B7E95"
              style={[styles.input, styles.contentInput]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <ScrollView style={styles.modalCategoryScroll} horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setEditCategoryId(cat.id)}
                  style={[
                    styles.modalCategoryChip,
                    editCategoryId === cat.id && styles.modalCategoryChipSelected,
                  ]}>
                  <Text
                    style={[
                      styles.modalCategoryChipText,
                      editCategoryId === cat.id && styles.modalCategoryChipTextSelected,
                    ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditingNote(null)} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleUpdateNote}
                disabled={isSaving}
                style={[styles.modalSaveButton, isSaving && styles.addButtonDisabled]}>
                <Text style={styles.modalSaveText}>{isSaving ? '...' : 'Guardar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deletingNoteId !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar nota</Text>
            <Text style={styles.confirmText}>¿Estás seguro de que querés eliminar esta nota?</Text>

            <View style={styles.modalActions}>
              <Pressable onPress={() => setDeletingNoteId(null)} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmDeleteNote}
                style={[styles.modalSaveButton, styles.deleteConfirmButton]}>
                <Text style={styles.modalSaveText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F5FB',
    padding: 16,
  },
  title: {
    color: '#11243A',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: '#4E647D',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D7E3F0',
  },
  formScroll: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F4F9FF',
    borderColor: '#CFE0F2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F223B',
    fontSize: 14,
    marginBottom: 8,
  },
  contentInput: {
    minHeight: 70,
    paddingTop: 10,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F9FF',
    borderColor: '#CFE0F2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  categorySelectorText: {
    color: '#0F223B',
    fontSize: 14,
  },
  categorySelectorPlaceholder: {
    color: '#6B7E95',
    fontSize: 14,
  },
  arrow: {
    color: '#6B7E95',
    fontSize: 10,
  },
  categoryDropdown: {
    backgroundColor: '#F4F9FF',
    borderColor: '#CFE0F2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
  },
  categoryOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryOptionSelected: {
    backgroundColor: '#1A4B8F',
  },
  categoryOptionText: {
    color: '#0F223B',
    fontSize: 14,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  newCategoryLink: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  newCategoryLinkText: {
    color: '#1A4B8F',
    fontSize: 13,
    fontWeight: '600',
  },
  newCategoryRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  newCategoryInput: {
    flex: 1,
    marginBottom: 0,
  },
  addCategoryButton: {
    backgroundColor: '#1A4B8F',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#1A4B8F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  counterText: {
    color: '#547091',
    fontSize: 13,
    marginBottom: 10,
    marginTop: 4,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorText: {
    color: '#9E2A2A',
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1A4B8F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyText: {
    color: '#6A819B',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
  noteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF2F9',
    gap: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  noteTitle: {
    color: '#123152',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#E3EDF7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#1A4B8F',
    fontSize: 11,
    fontWeight: '700',
  },
  noteContent: {
    color: '#4E647D',
    fontSize: 13,
    lineHeight: 18,
  },
  noteDate: {
    color: '#8A9FB5',
    fontSize: 11,
    marginTop: 2,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    color: '#1A4B8F',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: '#B73535',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: '#11243A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalCategoryScroll: {
    marginBottom: 16,
    maxHeight: 40,
  },
  modalCategoryChip: {
    backgroundColor: '#F4F9FF',
    borderColor: '#CFE0F2',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalCategoryChipSelected: {
    backgroundColor: '#1A4B8F',
    borderColor: '#1A4B8F',
  },
  modalCategoryChipText: {
    color: '#0F223B',
    fontSize: 13,
  },
  modalCategoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#6B7E95',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: '#1A4B8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    color: '#4E647D',
    fontSize: 14,
    marginBottom: 20,
  },
  deleteConfirmButton: {
    backgroundColor: '#B73535',
  },
});
