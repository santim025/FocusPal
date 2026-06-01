import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stepper } from '@/components/ui';
import { DEFAULT_TASK_TYPE, getTaskType, taskTypes } from '@/lib/taskTypes';
import { useTasksStore, type Task } from '@/store/tasksStore';
import { useTheme } from '@/theme/useTheme';

export default function TasksScreen() {
  const { neutral, accent } = useTheme();
  const tasks = useTasksStore((s) => s.tasks);
  const activeTaskId = useTasksStore((s) => s.activeTaskId);
  const addTask = useTasksStore((s) => s.addTask);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const setActive = useTasksStore((s) => s.setActive);
  const clearCompleted = useTasksStore((s) => s.clearCompleted);

  const [title, setTitle] = useState('');
  const [estimate, setEstimate] = useState(1);
  const [typeKey, setTypeKey] = useState(DEFAULT_TASK_TYPE);

  const pending = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - pending.length;

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, typeKey, estimate);
    setTitle('');
    setEstimate(1);
    setTypeKey(DEFAULT_TASK_TYPE);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: neutral.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: neutral.text }]}>Tareas</Text>
        {doneCount > 0 ? (
          <Pressable onPress={clearCompleted} hitSlop={8}>
            <Text style={[styles.clear, { color: accent.work }]}>Limpiar hechas ({doneCount})</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={neutral.textMuted} />
            <Text style={[styles.emptyText, { color: neutral.textMuted }]}>
              Aún no tienes tareas. Agrega una abajo para empezar a enfocarte.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            active={item.id === activeTaskId}
            accent={accent.work}
            onToggle={() => toggleDone(item.id)}
            onDelete={() => deleteTask(item.id)}
            onSelect={() => setActive(item.id === activeTaskId ? null : item.id)}
          />
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.composer, { backgroundColor: neutral.surface, borderColor: neutral.border }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="¿En qué vas a trabajar?"
            placeholderTextColor={neutral.textMuted}
            style={[styles.input, { color: neutral.text }]}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
            keyboardShouldPersistTaps="handled"
          >
            {taskTypes.map((t) => {
              const selected = t.key === typeKey;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTypeKey(t.key)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: selected ? accent.work : neutral.surfaceAlt,
                      borderColor: selected ? accent.work : neutral.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={t.icon as never}
                    size={14}
                    color={selected ? '#fff' : neutral.textMuted}
                  />
                  <Text
                    style={[styles.typeChipText, { color: selected ? '#fff' : neutral.text }]}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={[styles.typeHint, { color: neutral.textMuted }]}>
            {getTaskType(typeKey).description}
          </Text>
          <View style={styles.composerRow}>
            <View style={styles.estimateRow}>
              <Ionicons name="timer-outline" size={16} color={neutral.textMuted} />
              <Text style={[styles.estimateLabel, { color: neutral.textMuted }]}>Pomodoros</Text>
              <Stepper value={estimate} onChange={setEstimate} min={1} max={20} />
            </View>
            <Pressable
              onPress={submit}
              style={[styles.addBtn, { backgroundColor: accent.work, opacity: title.trim() ? 1 : 0.4 }]}
              disabled={!title.trim()}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TaskItem({
  task,
  active,
  accent,
  onToggle,
  onDelete,
  onSelect,
}: {
  task: Task;
  active: boolean;
  accent: string;
  onToggle: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const { neutral } = useTheme();
  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.task,
        {
          backgroundColor: neutral.surface,
          borderColor: active ? accent : neutral.border,
          borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Pressable onPress={onToggle} hitSlop={8}>
        <Ionicons
          name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={task.done ? accent : neutral.textMuted}
        />
      </Pressable>
      <View style={styles.taskBody}>
        <Text
          style={[
            styles.taskTitle,
            { color: neutral.text },
            task.done && { textDecorationLine: 'line-through', color: neutral.textMuted },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.taskMetaRow}>
          <Ionicons name={getTaskType(task.typeKey).icon as never} size={12} color={neutral.textMuted} />
          <Text style={[styles.taskMeta, { color: neutral.textMuted }]}>
            {getTaskType(task.typeKey).name} · {task.completedPomodoros}/{task.estimatedPomodoros}
            {active ? ' · activa' : ''}
          </Text>
        </View>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={neutral.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heading: { fontSize: 28, fontWeight: '800' },
  clear: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 10 },
  empty: { alignItems: 'center', gap: 12, paddingTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  taskMeta: { fontSize: 12 },
  composer: {
    margin: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: { fontSize: 16, paddingVertical: 4 },
  typeRow: { gap: 8, paddingVertical: 2 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  typeHint: { fontSize: 12, marginTop: -2 },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estimateLabel: { fontSize: 13, fontWeight: '600' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
