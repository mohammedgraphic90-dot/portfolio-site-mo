"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Image as ImageIcon,
  Save,
  LayoutDashboard,
  Eye,
  Activity,
  Home,
  Inbox,
  ClipboardList,
  Mail,
  Archive,
  Reply,
  CheckCircle2,
  Circle,
  RotateCcw,
  Pencil,
  Upload,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabasePublic";

type ProjectRow = {
  id: number;
  slug: string | null;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  sort_order: number;
};

type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: "new" | "read" | "archived";
  archived_at: string | null;
  status_before_archive: "new" | "read" | null;
};

type ProjectRequestRow = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  budget_range: string;
  timeline: string;
  services_needed: string[];
  project_details: string;
  status: "new" | "in_progress" | "done" | "archived";
  status_before_archive: "new" | "in_progress" | "done" | null;
  is_read: boolean;
  created_at: string;
  archived_at: string | null;
};

type ProjectActionResult = { ok: boolean; slug?: string; message?: string; revalidated?: boolean };

export default function DashboardPage() {
  const router = useRouter();

  // ---------- UI Tabs ----------
  const [mainTab, setMainTab] = useState<"projects" | "inbox">("projects");
  const [inboxTab, setInboxTab] = useState<"messages" | "requests">("messages");
  const [showArchived, setShowArchived] = useState(false);

  // ---------- Auth ----------
  const [checking, setChecking] = useState(true);

  // ---------- Projects ----------
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // ---------- Inbox ----------
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [requests, setRequests] = useState<ProjectRequestRow[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);

  // ---------- Analytics ----------
  const [portfolioViews, setPortfolioViews] = useState<number>(0);

  // ---------- Busy ----------
  const [busyAction, setBusyAction] = useState(false);

  // ---------- Add Project Modal ----------
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    description: "",
    projectUrl: "",
    imageUrl: "",
  });
  const [addUploading, setAddUploading] = useState(false);
  const [addUploadError, setAddUploadError] = useState<string | null>(null);

  // ---------- Edit Project Modal ----------
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState<{
    id: number;
    title: string;
    category: string;
    description: string;
    projectUrl: string;
    imageUrl: string;
  } | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);

  // ---------- Helpers ----------
  function buildGmailComposeUrl(to: string, subject: string, body: string) {
    const base = "https://mail.google.com/mail/?view=cm&fs=1";
    const q =
      `&to=${encodeURIComponent(to)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    return base + q;
  }

  function openReplyForMessage(m: ContactMessageRow) {
    const subject = `Re: Your message`;
    const body =
      `Hi ${m.name},\n\n` +
      `Thanks for reaching out!\n\n` +
      `Regarding your message:\n` +
      `"${m.message}"\n\n` +
      `My reply:\n` +
      `[Write your response here]\n\n` +
      `Best regards,\n` +
      `Mohammed`;
    window.open(buildGmailComposeUrl(m.email, subject, body), "_blank");
  }

  function openReplyForRequest(r: ProjectRequestRow) {
    const subject = `Re: Project request`;
    const services = (r.services_needed ?? []).join(", ") || "—";
    const body =
      `Hi ${r.name},\n\n` +
      `Thanks for your project request! Here is what I received:\n\n` +
      `Company: ${r.company ?? "—"}\n` +
      `Budget: ${r.budget_range}\n` +
      `Timeline: ${r.timeline}\n` +
      `Services: ${services}\n\n` +
      `Details:\n"${r.project_details}"\n\n` +
      `My response:\n` +
      `[Write your response here]\n\n` +
      `Best regards,\n` +
      `Mohammed`;
    window.open(buildGmailComposeUrl(r.email, subject, body), "_blank");
  }

  function formatBadge(n: number) {
    if (n <= 0) return null;
    if (n > 99) return "+99";
    return String(n);
  }

  async function getAccessToken(): Promise<string> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Failed to get session token");
    const token = data.session?.access_token;
    if (!token) throw new Error("No access token");
    return token;
  }

  async function uploadProjectImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/project-image", {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok || !data?.url) {
      throw new Error(data?.message || "Upload failed");
    }

    return String(data.url);
  }

  // ---------- Auth check ----------
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router]);

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // ---------- Analytics ----------
  async function loadAnalytics() {
    try {
      const res = await fetch("/api/analytics/stats", { method: "GET" });
      const data = await res.json().catch(() => null);
      setPortfolioViews(Number(data?.portfolioViews ?? 0));
    } catch {
      setPortfolioViews(0);
    }
  }

  // ---------- Load Projects ----------
  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id,slug,title,category,description,image_url,project_url,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("load projects error:", error);
        setProjects([]);
        return;
      }

      setProjects((data ?? []) as ProjectRow[]);
    } finally {
      setLoadingProjects(false);
    }
  }

  // ---------- Load Inbox ----------
  async function loadInbox() {
    setLoadingInbox(true);
    try {
      // contact_messages
      const msgQuery = supabase
        .from("contact_messages")
        .select("id,name,email,message,created_at,status,archived_at,status_before_archive")
        .order("created_at", { ascending: false });

      const { data: msgData, error: msgErr } = showArchived
        ? await msgQuery
        : await msgQuery.neq("status", "archived");

      if (msgErr) {
        console.error("load contact_messages error:", msgErr);
        setMessages([]);
      } else {
        setMessages((msgData ?? []) as ContactMessageRow[]);
      }

      // project_requests
      const reqQuery = supabase
        .from("project_requests")
        .select(
          "id,name,email,company,budget_range,timeline,services_needed,project_details,status,status_before_archive,is_read,created_at,archived_at"
        )
        .order("created_at", { ascending: false });

      const { data: reqData, error: reqErr } = showArchived
        ? await reqQuery
        : await reqQuery.neq("status", "archived");

      if (reqErr) {
        console.error("load project_requests error:", reqErr);
        setRequests([]);
      } else {
        setRequests((reqData ?? []) as ProjectRequestRow[]);
      }
    } finally {
      setLoadingInbox(false);
    }
  }

  useEffect(() => {
    if (!checking) {
      loadProjects();
      loadInbox();
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  useEffect(() => {
    if (!checking) loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const totalProjects = projects.length;

 const unreadCount =
  messages.filter((m) => m.status === "new").length +
  requests.filter((r) => !r.is_read && r.status !== "archived").length;


  const inboxBadge = formatBadge(unreadCount);

  // ---------- Reorder Projects (swap sort_order) ----------
  async function moveProject(index: number, direction: "up" | "down") {
    if (busyAction) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const a = projects[index];
    const b = projects[targetIndex];

    // Optimistic UI
    const next = [...projects];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setProjects(next);

    setBusyAction(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aId: a.id,
          bId: b.id,
        }),
      });

      const data: ProjectActionResult | null = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        console.error("reorder error:", data?.message);
        await loadProjects();
        alert(data?.message || "Reorder failed.");
      } else {
        const fixed = [...next];
        fixed[targetIndex] = { ...fixed[targetIndex], sort_order: a.sort_order };
        fixed[index] = { ...fixed[index], sort_order: b.sort_order };
        setProjects(fixed);

        if (data.revalidated === false) {
          alert("Order was saved, but static cache refresh failed. Please refresh again.");
        }
      }
    } catch (e: unknown) {
      console.error("reorder error:", e);
      await loadProjects();
      alert("Reorder failed.");
    } finally {
      setBusyAction(false);
    }
  }

  // ---------- Delete Project ----------
  async function handleDeleteProject(id: number) {
    if (busyAction) return;

    const ok = confirm("Delete this project?");
    if (!ok) return;

    const prev = projects;
    setProjects(projects.filter((p) => p.id !== id));

    setBusyAction(true);
    try {
      const token = await getAccessToken();

      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data: ProjectActionResult | null = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        console.error("delete project error:", data?.message);
        setProjects(prev);
        alert(data?.message || "Delete failed.");
        return;
      }

      if (data.revalidated === false) {
        alert("Project deleted, but static cache refresh failed. Please refresh again.");
      }
    } catch (e: unknown) {
      console.error("delete project error:", e);
      setProjects(prev);
      alert("Delete failed.");
    } finally {
      setBusyAction(false);
    }
  }

  // ---------- Add Project (Create via API) ----------
  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (busyAction) return;

    const title = newProject.title.trim();
    if (!title) return;

    setBusyAction(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: newProject.category.trim(),
          description: newProject.description.trim(),
          project_url: newProject.projectUrl.trim(),
          image_url: newProject.imageUrl.trim(),
        }),
      });

      const data: ProjectActionResult = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.message || "Create failed");
        return;
      }

      setIsAdding(false);
      setNewProject({
        title: "",
        category: "",
        description: "",
        projectUrl: "",
        imageUrl: "",
      });
      setAddUploadError(null);

      await loadProjects();

      if (data.revalidated === false) {
        alert("Project added, but static cache refresh failed. Please refresh again.");
      }

      if (data.slug) window.open(`/portfolio/${data.slug}`, "_blank");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleAddUploadChange(file: File | null) {
    if (!file) return;
    setAddUploadError(null);
    setAddUploading(true);
    try {
      const url = await uploadProjectImage(file);
      setNewProject((p) => ({ ...p, imageUrl: url }));
    } catch (e: any) {
      console.error("add upload error:", e);
      setAddUploadError(e?.message || "Upload failed");
    } finally {
      setAddUploading(false);
    }
  }

  // ---------- Edit Project (UI + API) ----------
  function openEditModal(p: ProjectRow) {
    setEditUploadError(null);
    setEditProject({
      id: p.id,
      title: p.title ?? "",
      category: p.category ?? "",
      description: p.description ?? "",
      projectUrl: p.project_url ?? "",
      imageUrl: p.image_url ?? "",
    });
    setIsEditing(true);
  }

  async function handleEditProject(e: React.FormEvent) {
    e.preventDefault();
    if (busyAction || !editProject) return;

    const title = editProject.title.trim();
    if (!title) return;

    setBusyAction(true);
    try {
      const token = await getAccessToken();

      const res = await fetch("/api/projects/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editProject.id,
          title,
          category: editProject.category.trim(),
          description: editProject.description.trim(),
          project_url: editProject.projectUrl.trim(),
          image_url: editProject.imageUrl.trim(),
        }),
      });

      const data: ProjectActionResult | null = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        alert(data?.message || "Update failed");
        return;
      }

      setIsEditing(false);
      setEditProject(null);
      await loadProjects();

      if (data.revalidated === false) {
        alert("Project updated, but static cache refresh failed. Please refresh again.");
      }
    } catch (e: any) {
      console.error("edit project error:", e);
      alert(e?.message || "Update failed");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleEditUploadChange(file: File | null) {
    if (!file || !editProject) return;
    setEditUploadError(null);
    setEditUploading(true);
    try {
      const url = await uploadProjectImage(file);
      setEditProject((p) => (p ? { ...p, imageUrl: url } : p));
    } catch (e: any) {
      console.error("edit upload error:", e);
      setEditUploadError(e?.message || "Upload failed");
    } finally {
      setEditUploading(false);
    }
  }

  // ---------- Messages Actions ----------
  async function markMessageRead(id: number) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", id);

      if (error) {
        console.error("mark read error:", error);
        alert("Update failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function markMessageUnread(id: number) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "new" })
        .eq("id", id);

      if (error) {
        console.error("mark unread error:", error);
        alert("Update failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function archiveMessage(m: ContactMessageRow) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          status_before_archive: m.status === "archived" ? "read" : m.status,
        })
        .eq("id", m.id);

      if (error) {
        console.error("archive message error:", error);
        alert("Archive failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function unarchiveMessage(m: ContactMessageRow) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const restore = m.status_before_archive ?? "read";
      const { error } = await supabase
        .from("contact_messages")
        .update({
          status: restore,
          archived_at: null,
          status_before_archive: null,
        })
        .eq("id", m.id);

      if (error) {
        console.error("unarchive message error:", error);
        alert("Unarchive failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function deleteMessage(id: number) {
    if (busyAction) return;

    const ok = confirm("Delete this message permanently?");
    if (!ok) return;

    setBusyAction(true);
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) {
        console.error("delete message error:", error);
        alert("Delete failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  // ---------- Requests Actions ----------
  async function markRequestRead(id: number, isRead: boolean) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const { error } = await supabase
        .from("project_requests")
        .update({ is_read: isRead })
        .eq("id", id);

      if (error) {
        console.error("mark request read/unread error:", error);
        alert("Update failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function updateRequestStatus(id: number, status: ProjectRequestRow["status"]) {
    if (busyAction) return;

    setBusyAction(true);
    try {
      const patch: any = { status };
      if (status === "archived") patch.archived_at = new Date().toISOString();

      const { error } = await supabase.from("project_requests").update(patch).eq("id", id);

      if (error) {
        console.error("update request status error:", error);
        alert("Update failed.");
        return;
      }

      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function archiveRequest(r: ProjectRequestRow) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const { error } = await supabase
        .from("project_requests")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          status_before_archive: r.status === "archived" ? "new" : r.status,
        })
        .eq("id", r.id);

      if (error) {
        console.error("archive request error:", error);
        alert("Archive failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function unarchiveRequest(r: ProjectRequestRow) {
    if (busyAction) return;
    setBusyAction(true);
    try {
      const restore = r.status_before_archive ?? "new";
      const { error } = await supabase
        .from("project_requests")
        .update({
          status: restore,
          archived_at: null,
          status_before_archive: null,
        })
        .eq("id", r.id);

      if (error) {
        console.error("unarchive request error:", error);
        alert("Unarchive failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  async function deleteRequest(id: number) {
    if (busyAction) return;

    const ok = confirm("Delete this request permanently?");
    if (!ok) return;

    setBusyAction(true);
    try {
      const { error } = await supabase.from("project_requests").delete().eq("id", id);
      if (error) {
        console.error("delete request error:", error);
        alert("Delete failed.");
        return;
      }
      await loadInbox();
    } finally {
      setBusyAction(false);
    }
  }

  // ---------- UI helpers ----------
  const stats = useMemo(() => {
    return {
      viewsLabel: "Portfolio views",
      growthLabel: "Tracking enabled",
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < projects.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      {/* Topbar */}
      <nav className="bg-slate-900 border-b border-white/5 py-4 px-6 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-teal-400 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
          >
            <Home size={18} />
            <span>Back to site</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-slate-300"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Main Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => setMainTab("projects")}
            className={[
              "px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all",
              mainTab === "projects"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            <ClipboardList size={16} />
            Projects
          </button>

          <button
            onClick={() => setMainTab("inbox")}
            className={[
              "relative px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all",
              mainTab === "inbox"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            <Inbox size={16} />
            Inbox

            {inboxBadge ? (
              <span className="ml-2 inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-black bg-amber-500/15 border border-amber-500/30 text-amber-200">
                {inboxBadge}
              </span>
            ) : null}
          </button>

        {mainTab === "inbox" ? (
  <div className="ml-auto flex items-center gap-2">
    <button
      onClick={() => setShowArchived((v) => !v)}
      className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-all"
    >
      {showArchived ? "Hide archived" : "Show archived"}
    </button>
  </div>
) : (
  <div className="ml-auto" />
)}

        </div>

        {mainTab === "projects" ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-purple-600/20" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Total projects</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{totalProjects}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                    <LayoutDashboard size={24} />
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[70%]" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-teal-600/20" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">{stats.viewsLabel}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{portfolioViews.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-teal-500/20 rounded-lg text-teal-400">
                    <Eye size={24} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold mt-2">
                  <Activity size={12} />
                  <span>{stats.growthLabel}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 hover:scale-110 hover:bg-white/20 transition-all cursor-pointer"
                  aria-label="add new project"
                >
                  <Plus size={32} className="text-white" />
                </button>
                <h3 className="font-bold text-white">Add new project</h3>
                <p className="text-slate-400 text-sm mt-1">Showcase your work</p>
              </div>
            </div>

            {/* Projects List */}
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Manage projects</h2>
                <span className="text-sm text-slate-400">Drag & drop (coming soon)</span>
              </div>

              {loadingProjects ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : (
                <div className="divide-y divide-white/5">
                  <AnimatePresence>
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveProject(index, "up")}
                              disabled={!canMoveUp(index) || busyAction}
                              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 hover:text-white"
                              aria-label="move up"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => moveProject(index, "down")}
                              disabled={!canMoveDown(index) || busyAction}
                              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 hover:text-white"
                              aria-label="move down"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>

                          <img
                            src={project.image_url ?? "https://picsum.photos/600/400?random=999"}
                            alt={project.title}
                            className="w-24 h-16 object-cover rounded-lg border border-white/10 bg-slate-800"
                          />
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                          <h3 className="font-bold text-white text-lg">{project.title}</h3>

                          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
                              {project.category ?? "General"}
                            </span>

                            {project.slug ? (
                              <a
                                href={`/portfolio/${project.slug}`}
                                target="_blank"
                                className="text-xs text-teal-300 hover:underline break-all"
                                rel="noreferrer"
                              >
                                /portfolio/{project.slug}
                              </a>
                            ) : null}
                          </div>

                          <p className="text-slate-400 text-sm mt-2 line-clamp-1">
                            {project.description ?? ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <button
                            onClick={() => openEditModal(project)}
                            disabled={busyAction}
                            className="p-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors group-hover:opacity-100 md:opacity-0 disabled:opacity-40"
                            aria-label="edit project"
                          >
                            <Pencil size={20} />
                          </button>

                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={busyAction}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group-hover:opacity-100 md:opacity-0 disabled:opacity-40"
                            aria-label="delete project"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {projects.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                      No projects yet. Add one!
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Inbox Tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setInboxTab("messages")}
                className={[
                  "px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all",
                  inboxTab === "messages"
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
                ].join(" ")}
              >
                <Mail size={16} />
                Messages
              </button>

              <button
                onClick={() => setInboxTab("requests")}
                className={[
                  "px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all",
                  inboxTab === "requests"
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
                ].join(" ")}
              >
                <ClipboardList size={16} />
                Project requests
              </button>
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {inboxTab === "messages" ? "Contact messages" : "Project requests"}
                </h2>
                <span className="text-sm text-slate-400">
                  {showArchived ? "Showing archived too" : "Active only"}
                </span>
              </div>

              {loadingInbox ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : inboxTab === "messages" ? (
                <div className="divide-y divide-white/5">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No messages.</div>
                  ) : (
                    messages.map((m) => {
                      const isUnread = m.status === "new";
                      return (
                        <div key={m.id} className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-black text-white">{m.name}</div>
                                <div className="text-sm text-slate-400 break-all">{m.email}</div>

                                <span
                                  className={[
                                    "px-2 py-0.5 rounded text-xs font-bold border",
                                    m.status === "archived"
                                      ? "bg-white/5 border-white/10 text-slate-300"
                                      : isUnread
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                                      : "bg-teal-500/10 border-teal-500/30 text-teal-200",
                                  ].join(" ")}
                                >
                                  {m.status}
                                </span>

                                <span className="text-xs text-slate-500">
                                  {new Date(m.created_at).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-slate-300 mt-3 whitespace-pre-wrap leading-7">
                                {m.message}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 justify-end">
                              <button
                                onClick={() => openReplyForMessage(m)}
                                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold flex items-center gap-2"
                              >
                                <Reply size={16} />
                                Reply
                              </button>

                              {m.status !== "archived" ? (
                                <>
                                  {isUnread ? (
                                    <button
                                      onClick={() => markMessageRead(m.id)}
                                      disabled={busyAction}
                                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                                    >
                                      <CheckCircle2 size={16} />
                                      Mark read
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => markMessageUnread(m.id)}
                                      disabled={busyAction}
                                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                                    >
                                      <Circle size={16} />
                                      Mark unread
                                    </button>
                                  )}

                                  <button
                                    onClick={() => archiveMessage(m)}
                                    disabled={busyAction}
                                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                                  >
                                    <Archive size={16} />
                                    Archive
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => unarchiveMessage(m)}
                                  disabled={busyAction}
                                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                                >
                                  <RotateCcw size={16} />
                                  Unarchive
                                </button>
                              )}

                              <button
                                onClick={() => deleteMessage(m.id)}
                                disabled={busyAction}
                                className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {requests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No requests.</div>
                  ) : (
                    requests.map((r) => (
                      <div key={r.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-black text-white">{r.name}</div>
                              <div className="text-sm text-slate-400 break-all">{r.email}</div>
                              {r.company ? <span className="text-sm text-slate-300">• {r.company}</span> : null}

                              <span
                                className={[
                                  "px-2 py-0.5 rounded text-xs font-bold border",
                                  r.status === "archived"
                                    ? "bg-white/5 border-white/10 text-slate-300"
                                    : r.is_read
                                    ? "bg-teal-500/10 border-teal-500/30 text-teal-200"
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-200",
                                ].join(" ")}
                              >
                                {r.status} {r.is_read ? "" : "(unread)"}
                              </span>

                              <span className="text-xs text-slate-500">
                                {new Date(r.created_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <div className="text-slate-400 text-xs mb-1">Budget</div>
                                <div className="text-white font-bold">{r.budget_range}</div>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <div className="text-slate-400 text-xs mb-1">Timeline</div>
                                <div className="text-white font-bold">{r.timeline}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="text-slate-400 text-xs mb-1">Services</div>
                              <div className="flex flex-wrap gap-2">
                                {(r.services_needed ?? []).length ? (
                                  r.services_needed.map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/20 text-purple-200"
                                    >
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 text-sm">—</span>
                                )}
                              </div>
                            </div>

                            <p className="text-slate-300 mt-4 whitespace-pre-wrap leading-7">
                              {r.project_details}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 min-w-[240px]">
                            <button
                              onClick={() => openReplyForRequest(r)}
                              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold flex items-center gap-2 justify-center"
                            >
                              <Reply size={16} />
                              Reply
                            </button>

                            <button
                              onClick={() => markRequestRead(r.id, !r.is_read)}
                              disabled={busyAction}
                              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2 justify-center"
                            >
                              {r.is_read ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                              {r.is_read ? "Mark unread" : "Mark read"}
                            </button>

                            <label className="text-xs text-slate-400 mt-2">Status</label>
                            <select
                              value={r.status}
                              onChange={(e) =>
                                updateRequestStatus(r.id, e.target.value as ProjectRequestRow["status"])
                              }
                              disabled={busyAction}
                              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold disabled:opacity-60"
                            >
                              <option value="new">new</option>
                              <option value="in_progress">in_progress</option>
                              <option value="done">done</option>
                              <option value="archived">archived</option>
                            </select>

                            {r.status !== "archived" ? (
                              <button
                                onClick={() => archiveRequest(r)}
                                disabled={busyAction}
                                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2 justify-center"
                              >
                                <Archive size={16} />
                                Archive
                              </button>
                            ) : (
                              <button
                                onClick={() => unarchiveRequest(r)}
                                disabled={busyAction}
                                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2 justify-center"
                              >
                                <RotateCcw size={16} />
                                Unarchive
                              </button>
                            )}

                            <button
                              onClick={() => deleteRequest(r.id)}
                              disabled={busyAction}
                              className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-200 text-sm font-bold disabled:opacity-60 flex items-center gap-2 justify-center"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add project</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-white"
                  aria-label="close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Example: E-commerce website"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProject.category}
                    onChange={(e) => setNewProject((p) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Example: React"
                  />
                </div>

                {/* Upload Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Upload image
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold flex items-center gap-2 cursor-pointer">
                      {addUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                      {addUploading ? "Uploading..." : "Choose file"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleAddUploadChange(e.target.files?.[0] ?? null)}
                        disabled={addUploading || busyAction}
                      />
                    </label>

                    {newProject.imageUrl ? (
                      <span className="text-xs text-slate-400 break-all line-clamp-1">
                        {newProject.imageUrl}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">No image uploaded yet</span>
                    )}
                  </div>

                  {addUploadError ? (
                    <p className="text-red-400 text-sm mt-2">{addUploadError}</p>
                  ) : null}
                </div>

                {/* Keep Image URL field (not removed) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Image URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newProject.imageUrl}
                      onChange={(e) => setNewProject((p) => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white pl-10 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="https://..."
                    />
                    <ImageIcon className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Live demo URL
                  </label>
                  <input
                    type="text"
                    value={newProject.projectUrl}
                    onChange={(e) => setNewProject((p) => ({ ...p, projectUrl: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                    rows={3}
                    placeholder="Short description..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={busyAction || addUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  <Save size={18} />
                  {busyAction ? "Saving..." : "Save project"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditing && editProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Edit project</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white"
                  aria-label="close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editProject.title}
                    onChange={(e) => setEditProject((p) => (p ? { ...p, title: e.target.value } : p))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Example: E-commerce website"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editProject.category}
                    onChange={(e) => setEditProject((p) => (p ? { ...p, category: e.target.value } : p))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Example: React"
                  />
                </div>

                {/* Upload Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Upload image
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-bold flex items-center gap-2 cursor-pointer">
                      {editUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                      {editUploading ? "Uploading..." : "Choose file"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleEditUploadChange(e.target.files?.[0] ?? null)}
                        disabled={editUploading || busyAction}
                      />
                    </label>

                    {editProject.imageUrl ? (
                      <span className="text-xs text-slate-400 break-all line-clamp-1">
                        {editProject.imageUrl}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">No image uploaded yet</span>
                    )}
                  </div>

                  {editUploadError ? (
                    <p className="text-red-400 text-sm mt-2">{editUploadError}</p>
                  ) : null}
                </div>

                {/* Keep Image URL field (not removed) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Image URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editProject.imageUrl}
                      onChange={(e) => setEditProject((p) => (p ? { ...p, imageUrl: e.target.value } : p))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white pl-10 focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="https://..."
                    />
                    <ImageIcon className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Live demo URL
                  </label>
                  <input
                    type="text"
                    value={editProject.projectUrl}
                    onChange={(e) => setEditProject((p) => (p ? { ...p, projectUrl: e.target.value } : p))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={editProject.description}
                    onChange={(e) =>
                      setEditProject((p) => (p ? { ...p, description: e.target.value } : p))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                    rows={3}
                    placeholder="Short description..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={busyAction || editUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  <Save size={18} />
                  {busyAction ? "Saving..." : "Save changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
