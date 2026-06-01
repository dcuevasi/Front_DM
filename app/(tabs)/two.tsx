import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/components/AuthContext';

const demoMessages = [
  { id: '1', title: 'Soporte IPSS', preview: 'Tu solicitud fue registrada correctamente.' },
  { id: '2', title: 'Equipo Medico', preview: 'Tienes una cita sugerida para la proxima semana.' },
  { id: '3', title: 'Recordatorio', preview: 'No olvides actualizar tus datos de contacto.' },
];

export default function ProfileScreen() {
  const { email } = useAuth();
  const nameFromEmail = email
    ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    : 'Usuario';

  return (
    <View style={styles.screen}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={42} color="#8CA0B8" />
        </View>
        <Text style={styles.name}>{nameFromEmail}</Text>
        <Text style={styles.email}>{email ?? 'sin-correo@demo.com'}</Text>
      </View>

      <View style={styles.messagesCard}>
        <Text style={styles.messagesTitle}>Últimos mensajes</Text>
        {demoMessages.map((message) => (
          <View key={message.id} style={styles.messageItem}>
            <Text style={styles.messageSender}>{message.title}</Text>
            <Text style={styles.messagePreview}>{message.preview}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF3F8',
    padding: 18,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE7F1',
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#ECF2F8',
    borderWidth: 1,
    borderColor: '#D7E2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    color: '#1B2A3B',
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    color: '#49617A',
    fontSize: 14,
    marginTop: 6,
  },
  messagesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DEE7F1',
  },
  messagesTitle: {
    color: '#1B2A3B',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  messageItem: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 10,
    paddingBottom: 8,
  },
  messageSender: {
    color: '#2E455D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  messagePreview: {
    color: '#60768D',
    fontSize: 13,
    lineHeight: 18,
  },
});
