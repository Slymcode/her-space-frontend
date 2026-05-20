import { api } from "./axios";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation?: string | null;
}

export async function getEmergencyContacts() {
  const { data } = await api.get<EmergencyContact[]>("/emergency/contacts");
  return data;
}

export async function addEmergencyContact(contact: {
  name: string;
  phone: string;
  relation?: string;
}) {
  const { data } = await api.post<EmergencyContact>("/emergency/contacts", contact);
  return data;
}

export async function deleteEmergencyContact(id: string) {
  await api.delete(`/emergency/contacts/${id}`);
}

export const emergencyApi = {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
};
