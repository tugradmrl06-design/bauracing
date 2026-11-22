import type { PlatformData } from "@/types/platform";

const now = new Date("2026-11-22T12:00:00.000Z");
const iso = (offset: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

export const seedData: PlatformData = {
  users: [
    { id: "user-admin", name: "Arda Kaya", email: "admin@bauracing.team", password: "admin123", status: "Approved", role: "Super Admin", departmentId: "dept-software", subTeam: "Embedded", memberId: "member-1", createdAt: iso(-180) },
    { id: "user-member", name: "Elif Demir", email: "member@bauracing.team", password: "member123", status: "Approved", role: "Department Lead", departmentId: "dept-software", subTeam: "Telemetry", memberId: "member-2", createdAt: iso(-150) },
  ],
  membershipApplications: [
    { id: "application-1", name: "Deniz Yılmaz", email: "deniz@bauracing.team", password: "demo123", departmentId: "dept-mechanical", subTeam: "Chassis", experience: "CAD, FEA ve araç dinamiği", statement: "Formula Student takımında mekanik tasarım ve analiz çalışmalarına katkı sağlamak istiyorum.", status: "Pending", createdAt: iso(-2) },
  ],
  departments: [
    { id: "dept-software", name: "Software", description: "Vehicle control, telemetry and embedded systems", leadId: "member-1", subTeams: ["Embedded", "Telemetry"], memberIds: ["member-1", "member-2"], createdAt: iso(-90) },
    { id: "dept-mechanical", name: "Mechanical", description: "Chassis, suspension and powertrain", leadId: "member-3", subTeams: ["Chassis", "Powertrain"], memberIds: ["member-3", "member-4"], createdAt: iso(-90) },
    { id: "dept-electrical", name: "Electrical", description: "LV systems, HV systems and wiring", leadId: "member-5", subTeams: ["Low Voltage", "High Voltage"], memberIds: ["member-5"], createdAt: iso(-90) },
    { id: "dept-aero", name: "Aerodynamics", description: "Aerodynamic design and CFD", leadId: "member-6", subTeams: ["CFD", "Manufacturing"], memberIds: ["member-6"], createdAt: iso(-90) },
    { id: "dept-business", name: "Business", description: "Sponsorship, finance and communications", subTeams: ["Sponsorship", "Events"], memberIds: ["member-7"], createdAt: iso(-90) },
  ],
  members: [
    { id: "member-1", name: "Arda Kaya", email: "arda@bauracing.team", role: "Super Admin", departmentId: "dept-software", subTeam: "Embedded", createdAt: iso(-180) },
    { id: "member-2", name: "Elif Demir", email: "elif@bauracing.team", role: "Department Lead", departmentId: "dept-software", subTeam: "Telemetry", createdAt: iso(-150) },
    { id: "member-3", name: "Can Yıldız", email: "can@bauracing.team", role: "Team Captain", departmentId: "dept-mechanical", subTeam: "Chassis", createdAt: iso(-170) },
    { id: "member-4", name: "Mert Aydın", email: "mert@bauracing.team", role: "Member", departmentId: "dept-mechanical", subTeam: "Powertrain", createdAt: iso(-120) },
    { id: "member-5", name: "Zeynep Koç", email: "zeynep@bauracing.team", role: "Department Lead", departmentId: "dept-electrical", subTeam: "High Voltage", createdAt: iso(-145) },
    { id: "member-6", name: "Kerem Şahin", email: "kerem@bauracing.team", role: "Department Lead", departmentId: "dept-aero", subTeam: "CFD", createdAt: iso(-130) },
    { id: "member-7", name: "Selin Er", email: "selin@bauracing.team", role: "Member", departmentId: "dept-business", subTeam: "Sponsorship", createdAt: iso(-100) },
  ],
  tasks: [
    { id: "task-1", title: "Telemetry veri paketlerini iyileştir", description: "CAN bus mesajlarını daha verimli paketleyip veri kaybını azalt.", departmentId: "dept-software", assigneeIds: ["member-1", "member-2"], priority: "high", status: "in_progress", startDate: iso(-5).slice(0, 10), dueDate: iso(3).slice(0, 10), comments: [{ id: "comment-1", authorId: "member-2", body: "Veri frekansları için ilk taslak hazır.", createdAt: iso(-1) }], createdAt: iso(-5), updatedAt: iso(-1) },
    { id: "task-2", title: "Suspension load-case analizi", description: "Statik ve dinamik yük senaryolarını doğrula.", departmentId: "dept-mechanical", assigneeIds: ["member-3", "member-4"], priority: "urgent", status: "review", startDate: iso(-12).slice(0, 10), dueDate: iso(-1).slice(0, 10), comments: [], createdAt: iso(-12), updatedAt: iso(-2) },
    { id: "task-3", title: "BMS alarm testlerini tamamla", description: "Seviye 1 ve seviye 2 alarm davranışlarını belgeleyip test et.", departmentId: "dept-electrical", assigneeIds: ["member-5"], priority: "high", status: "todo", startDate: iso(0).slice(0, 10), dueDate: iso(7).slice(0, 10), comments: [], createdAt: iso(-3), updatedAt: iso(-3) },
    { id: "task-4", title: "Rear wing CFD çalışması", description: "Yakın tracking senaryosu için rear wing ayarlarını optimize et.", departmentId: "dept-aero", assigneeIds: ["member-6"], priority: "medium", status: "done", startDate: iso(-20).slice(0, 10), dueDate: iso(-8).slice(0, 10), comments: [], createdAt: iso(-20), updatedAt: iso(-8) },
    { id: "task-5", title: "Sponsor sunumu güncelle", description: "Yeni teknik hedefleri ve araç görsellerini sunuma ekle.", departmentId: "dept-business", assigneeIds: ["member-7"], priority: "low", status: "todo", startDate: iso(2).slice(0, 10), dueDate: iso(14).slice(0, 10), comments: [], createdAt: iso(-1), updatedAt: iso(-1) },
  ],
  wikiPages: [
    { id: "wiki-1", title: "CAN Bus Konvansiyonları", slug: "can-bus-konvansiyonlari", content: "CAN ağındaki frame ID dağılımı, dönüş hızları ve hata yönetimi kurallarını bu sayfada bulabilirsiniz.\n\n## Veri formatı\nHer mesajın 11-bit CAN ID kullanması ve öncelik alanlarının departman bazında ayrılması gerekir.", category: "Software", departmentId: "dept-software", isPublic: true, createdAt: iso(-30), updatedAt: iso(-2), authorId: "member-1" },
    { id: "wiki-2", title: "Suspension Design Guide", slug: "suspension-design-guide", content: "Kinematic ve compliance hedefleri, test prosedürü ve teslim kriterleri.\n\n## İlk kontrol\nWheel travel, camber gain ve track width değişimleri katı gövde varsayımlarıyla doğrulanmalıdır.", category: "Mechanical", departmentId: "dept-mechanical", isPublic: true, createdAt: iso(-45), updatedAt: iso(-5), authorId: "member-3" },
  ],
  files: [
    { id: "file-1", name: "vehicle-systems.pdf", description: "Araç sistemleri genel mimari raporu", category: "PDF", departmentId: "dept-software", size: "2.4 MB", mimeType: "application/pdf", createdAt: iso(-10), uploadedBy: "member-1" },
    { id: "file-2", name: "front-upright.step", description: "Ön dingil üpk adım dosyası", category: "CAD", departmentId: "dept-mechanical", size: "18.7 MB", mimeType: "application/step", createdAt: iso(-8), uploadedBy: "member-3" },
  ],
  announcements: [
    { id: "announcement-1", title: "Formula Student başvuru takvimi güncellendi", body: "Yeni teknik inceleme toplantıları ve teslim tarihlerinin revize edilmiş planı yönetim duyurusudur.", pinned: true, publishedAt: iso(-1), createdAt: iso(-1), createdBy: "member-3" },
    { id: "announcement-2", title: "Software sprint değerlendirme toplantısı", body: "Cuma günü telemetry ve embedded ekipleri için sprint değerlendirmesi yapılacaktır.", departmentId: "dept-software", pinned: false, publishedAt: iso(-3), createdAt: iso(-3), createdBy: "member-1" },
  ],
  meetings: [
    { id: "meeting-1", title: "Design Review", date: iso(2).slice(0, 10), time: "18:30", location: "Engineering Lab", description: "Araç alt sistem tasarım değerlendirmesi.", departmentId: "dept-mechanical", participantIds: ["member-3", "member-4", "member-5"], createdAt: iso(-4) },
    { id: "meeting-2", title: "Software Sprint", date: iso(5).slice(0, 10), time: "20:00", location: "Online", description: "Sprint hedefleri ve kod inceleme oturumu.", departmentId: "dept-software", participantIds: ["member-1", "member-2"], createdAt: iso(-2) },
  ],
  activities: [
    { id: "activity-1", action: "Telemetry görevini oluşturdu", entityType: "task", entityId: "task-1", createdAt: iso(-1) },
    { id: "activity-2", action: "CAN Bus sayfasını güncelledi", entityType: "wiki", entityId: "wiki-1", createdAt: iso(-2) },
    { id: "activity-3", action: "Yeni duyuru yayınladı", entityType: "announcement", entityId: "announcement-1", createdAt: iso(-3) },
  ],
  wikiCategories: ["Software", "Mechanical", "Electrical", "Aerodynamics", "Business", "General Documentation", "Competition Preparation", "Research & Development"],
  wikiCategoryDetails: [
    { id: "category-software", name: "Software", description: "Embedded systems, telemetry and vehicle software", icon: "code", order: 0 },
    { id: "category-mechanical", name: "Mechanical", description: "Chassis, suspension and powertrain documentation", icon: "mechanical", order: 1 },
    { id: "category-electrical", name: "Electrical", description: "Low/high voltage systems and wiring", icon: "electrical", order: 2 },
    { id: "category-aero", name: "Aerodynamics", description: "CFD, aero surfaces and wind tunnel studies", icon: "aero", order: 3 },
    { id: "category-business", name: "Business", description: "Sponsorship, finance and operations", icon: "business", order: 4 },
    { id: "category-general", name: "General Documentation", description: "Team-wide procedures and standards", icon: "book", order: 5 },
    { id: "category-competition", name: "Competition Preparation", description: "Scrutineering, event planning and checklists", icon: "competition", order: 6 },
    { id: "category-rd", name: "Research & Development", description: "Experiments, investigations and prototypes", icon: "research", order: 7 },
  ],
  wikiFavorites: ["wiki-1"],
};
