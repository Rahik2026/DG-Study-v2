'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, FileText, MessageSquare, BarChart3,
  TrendingUp, AlertTriangle, Ban, CheckCircle, Eye,
  MoreHorizontal, Search, Filter, Download, Trash2,
  UserCheck, UserX, Activity, Database, Server,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useStore } from '@/stores/useStore';
import { demoStats } from '@/lib/demo-data';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'system', label: 'System', icon: Server },
];

const monthlyData = [
  { month: 'Jan', users: 180, posts: 420, files: 65 },
  { month: 'Feb', users: 250, posts: 580, files: 89 },
  { month: 'Mar', users: 380, posts: 720, files: 110 },
  { month: 'Apr', users: 520, posts: 950, files: 145 },
  { month: 'May', users: 750, posts: 1200, files: 198 },
  { month: 'Jun', users: 1247, posts: 1800, files: 280 },
];

export default function AdminPage() {
  const { users, posts, files, chatRooms } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your campus platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" dot>System Healthy</Badge>
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div variants={item} className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-white/[0.06] pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2
                ${activeTab === tab.id
                  ? 'text-indigo-400 border-indigo-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-white/10'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length.toString(), change: '+12.5%', icon: Users, color: 'from-indigo-500 to-blue-500', positive: true },
                { label: 'Total Posts', value: posts.length.toString(), change: '+8.2%', icon: MessageSquare, color: 'from-emerald-500 to-teal-500', positive: true },
                { label: 'Files Uploaded', value: files.length.toString(), change: '+15.3%', icon: FileText, color: 'from-purple-500 to-pink-500', positive: true },
                { label: 'Active Chats', value: chatRooms.length.toString(), change: '+5.1%', icon: Activity, color: 'from-amber-500 to-orange-500', positive: true },
              ].map((stat) => (
                <Card key={stat.label} hover glow>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {stat.change} this month
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <Card>
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Growth Analytics
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                        <YAxis stroke="#6b7280" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#growthGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="posts" stroke="#a855f7" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card>
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Content Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demoStats.weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                        <YAxis stroke="#6b7280" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                        <Bar dataKey="posts" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="files" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Recent activity table */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Recent User Activity
                  </h3>
                  <Button variant="ghost" size="xs">View All</Button>
                </div>
                <div className="space-y-2">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.uid} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <Avatar name={u.displayName} size="md" isOnline={u.isOnline} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{u.displayName}</span>
                          <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'purple' : 'default'} size="sm">
                            {u.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{u.email} · {u.department}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={u.isOnline ? 'success' : 'default'} size="sm" dot>
                          {u.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === 'users' && (
          <motion.div variants={item}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">All Users</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-56"
                    />
                  </div>
                  <Button variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
                </div>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.uid} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <Avatar name={u.displayName} size="md" isOnline={u.isOnline} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white">{u.displayName}</span>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'purple' : 'default'} size="sm">
                      {u.role}
                    </Badge>
                    <span className="text-xs text-gray-500">{u.department}</span>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Recent Posts
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar name={p.authorName} size="xs" />
                      <span className="text-xs font-medium text-gray-300">{p.authorName}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{p.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                      <span>{p.likes.length} likes</span>
                      <span>{p.commentCount} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Recent Files
              </h3>
              <div className="space-y-3">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.02]">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{f.fileName}</p>
                      <p className="text-[11px] text-gray-500">{f.uploaderName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Firebase', status: 'Connected', icon: Database, variant: 'success' as const, detail: 'Firestore + Auth' },
              { label: 'Google Drive', status: 'Connected', icon: Server, variant: 'success' as const, detail: 'API v3' },
              { label: 'Storage Usage', status: '2.4 GB / 15 GB', icon: Database, variant: 'info' as const, detail: 'Google Drive' },
              { label: 'API Requests', status: '12,456 today', icon: Activity, variant: 'success' as const, detail: 'Avg 120ms response' },
              { label: 'Active Sessions', status: '89 users', icon: Users, variant: 'success' as const, detail: 'Last 24 hours' },
              { label: 'Error Rate', status: '0.02%', icon: AlertTriangle, variant: 'success' as const, detail: 'Below threshold' },
            ].map((sys) => (
              <Card key={sys.label} hover>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    <sys.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{sys.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={sys.variant} size="sm" dot>{sys.status}</Badge>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{sys.detail}</p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
