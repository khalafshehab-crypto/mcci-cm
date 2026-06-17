export interface Member {
  id: number;
  title: string;
  customTitle?: string;
  name: string;
  role: string;
  committeeId: number;
  committeeName: string;
  joiningMechanism: string;
  email: string;
  phone: string;
  nationalId: string;
  membershipType: string;
  active: boolean;
  joinedDate: string;
  note?: string;
}

const RAW_MEMBERS_DATA: Array<[number, string, string, string, string, number, string, string, string, string, string, boolean, string]> = [];

export const INITIAL_MEMBERS: Member[] = RAW_MEMBERS_DATA.map(([id, title, customTitle, name, role, committeeId, committeeName, joiningMechanism, email, phone, nationalId, active, note]) => ({
  id,
  title,
  customTitle: customTitle || undefined,
  name,
  role,
  committeeId,
  committeeName,
  joiningMechanism,
  email,
  phone,
  nationalId,
  membershipType: "خارجي",
  active,
  joinedDate: "2026-01-10",
  note: note || undefined
}));
