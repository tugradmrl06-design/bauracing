export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type UserRole =
  | "Super Admin"
  | "Team Captain"
  | "Department Lead"
  | "Member"
  | "Mentor";

export interface Department {
  id: string;
  name: string;
  description: string;
  leadId?: string;
  subTeams: string[];
  memberIds: string[];
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  subTeam?: string;
  avatar?: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  assigneeIds: string[];
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  attachmentName?: string;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  category: string;
  categoryId?: string;
  summary?: string;
  favorite?: boolean;
  attachments?: WikiAttachment[];
  departmentId?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface WikiCategory {
  id: string;
  name: string;
  description: string;
  icon: "code" | "mechanical" | "electrical" | "aero" | "business" | "book" | "competition" | "research";
  order: number;
  departmentId?: string;
}

export interface WikiAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  kind: "image" | "document";
  blobId?: string;
  createdAt: string;
}

export interface PlatformFile {
  id: string;
  name: string;
  description: string;
  category: "PDF" | "Image" | "CAD" | "ZIP" | "Code" | "Document";
  departmentId?: string;
  size: string;
  mimeType: string;
  createdAt: string;
  uploadedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  departmentId?: string;
  pinned: boolean;
  publishedAt: string;
  createdAt: string;
  createdBy: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  departmentId?: string;
  participantIds: string[];
  createdAt: string;
}

export type MembershipStatus = "Pending" | "Approved" | "Rejected";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  password: string;
  status: MembershipStatus;
  role: UserRole;
  departmentId?: string;
  subTeam?: string;
  memberId?: string;
  createdAt: string;
}

export interface MembershipApplication {
  id: string;
  name: string;
  email: string;
  password: string;
  departmentId: string;
  subTeam: string;
  experience: string;
  statement: string;
  status: "Pending" | "Approved" | "Rejected";
  assignedDepartmentId?: string;
  assignedSubTeam?: string;
  assignedRole?: UserRole;
  createdAt: string;
  reviewedAt?: string;
}

export interface Activity {
  id: string;
  action: string;
  entityType: "task" | "wiki" | "department" | "member" | "file" | "announcement" | "meeting";
  entityId: string;
  createdAt: string;
}

export interface PlatformData {
  departments: Department[];
  members: Member[];
  tasks: Task[];
  wikiPages: WikiPage[];
  files: PlatformFile[];
  announcements: Announcement[];
  meetings: Meeting[];
  activities: Activity[];
  wikiCategories: string[];
  wikiCategoryDetails?: WikiCategory[];
  wikiFavorites?: string[];
  users: PlatformUser[];
  membershipApplications: MembershipApplication[];
}
