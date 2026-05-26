'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Clock, FileText, MessageSquare,
  TrendingUp, Users, Zap, ChevronRight, Flame,
  Target, Award, Bell, ArrowUpRight, Timer,
  CheckCircle2, AlertCircle, BarChart3,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useStore } from '@/stores/useStore';
import { demoStats } from '@/lib/demo-data';
import { formatDistanceToNow, differenceInDays, differenceInHours, format } from 'date-fns';
import { toDate } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function CountdownTimer({ date }: { date: Date }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return <span className="text-red-400">Expired</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return (
    <div className="flex gap-2">
      {[
        { v: days, l: 'd' },
        { v: hours, l: 'h' },
        { v: mins, l: 'm' },
        { v: secs, l: 's' },
      ].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center">
          <span className="text-lg font-bold text-white tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 uppercase">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, homework, exams, announcements, notifications, posts } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const stats = [
    {
      label: 'Active Homework',
      value: homework.filter((h) => h.status === 'active').length.toString(),
      change: '+2 this week',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-400',
    },
    {
      label: 'Upcoming Exams',
      value: exams.filter((e) => new Date(e.date) > new Date()).length.toString(),
      change: 'Next in ' + differenceInDays(exams[1]?.date || new Date(), new Date()) + ' days',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Community Posts',
      value: posts.length.toString(),
      change: '+5 today',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      label: 'Unread Alerts',
      value: notifications.filter((n) => !n.read).length.toString(),
      change: 'Stay updated',
      icon: Bell,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
  ];

  const nextExam = exams.reduce((closest, exam) => {
    const examDate = toDate(exam.date);
    if (examDate < new Date()) return closest;
    if (!closest) return exam;
    return examDate < new Date(closest.date) ? exam : closest;
  }, null as typeof exams[0] | null);

  if (!mounted) return null;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.displayName?.split(' ')[0]}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening in your campus today</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" dot>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" /> 12 day streak
              </span>
            </Badge>
            <Badge variant="success" dot>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" /> Semester {user?.semester}
              </span>
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={stat.label} hover glow>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.textColor}`}>{stat.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Countdown */}
            {nextExam && (
              <motion.div variants={item}>
                <Card glow className="overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none" />
                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Timer className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">NEXT EXAM COUNTDOWN</p>
                        <p className="text-lg font-bold text-white">{nextExam.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="danger" size="sm">
                            {nextExam.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(toDate(nextExam.date), 'MMM d, yyyy')} · {nextExam.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CountdownTimer date={toDate(nextExam.date)} />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Activity Chart */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      Weekly Activity
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Posts, messages, and file uploads</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Posts</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Messages</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Files</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demoStats.weeklyActivity}>
                      <defs>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,15,25,0.95)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="posts" stroke="#6366f1" fill="url(#colorPosts)" strokeWidth={2} />
                      <Area type="monotone" dataKey="messages" stroke="#a855f7" fill="url(#colorMessages)" strokeWidth={2} />
                      <Area type="monotone" dataKey="files" stroke="#10b981" fill="url(#colorFiles)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Homework */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Homework & Assignments
                  </h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {homework.map((hw) => {
                    const daysLeft = differenceInDays(toDate(hw.dueDate), new Date());
                    const hoursLeft = differenceInHours(toDate(hw.dueDate), new Date());
                    const isOverdue = hw.status === 'overdue';
                    const isUrgent = daysLeft <= 1 && !isOverdue;

                    return (
                      <motion.div
                        key={hw.id}
                        whileHover={{ x: 4 }}
                        className={`
                          p-4 rounded-xl border transition-all cursor-pointer
                          ${isOverdue
                            ? 'border-red-500/20 bg-red-500/[0.03]'
                            : isUrgent
                              ? 'border-amber-500/20 bg-amber-500/[0.03]'
                              : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white">{hw.title}</h4>
                              {isOverdue && <Badge variant="danger" size="sm">Overdue</Badge>}
                              {isUrgent && <Badge variant="warning" size="sm" dot>Urgent</Badge>}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{hw.description}</p>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {hw.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {isOverdue
                                  ? 'Was due ' + formatDistanceToNow(toDate(hw.dueDate), { addSuffix: true })
                                  : hoursLeft < 24
                                    ? `${hoursLeft} hours left`
                                    : `${daysLeft} days left`
                                }
                              </span>
                            </div>
                          </div>
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${isOverdue ? 'bg-red-500/10' : isUrgent ? 'bg-amber-500/10' : 'bg-indigo-500/10'}
                          `}>
                            {isOverdue ? (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: MessageSquare, label: 'New Chat', color: 'from-indigo-500 to-blue-500', href: '/chat' },
                    { icon: FileText, label: 'Upload File', color: 'from-emerald-500 to-teal-500', href: '/files' },
                    { icon: BookOpen, label: 'Questions', color: 'from-purple-500 to-pink-500', href: '/questions' },
                    { icon: Users, label: 'Community', color: 'from-amber-500 to-orange-500', href: '/feed' },
                  ].map((action) => (
                    <motion.a
                      key={action.label}
                      href={action.href}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-300">{action.label}</span>
                    </motion.a>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    Announcements
                  </h3>
                </div>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <motion.div
                      key={ann.id}
                      whileHover={{ x: 2 }}
                      className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                          ${ann.priority === ('urgent' as string) ? 'bg-red-500' : ann.priority === 'high' ? 'bg-amber-500' : ann.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'}
                        `} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{ann.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
                            <span>{ann.authorName}</span>
                            <span>·</span>
                            <span>{formatDistanceToNow(toDate(ann.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Department Distribution */}
            <motion.div variants={item}>
              <Card>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-purple-400" />
                  Campus Community
                </h3>
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demoStats.departmentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {demoStats.departmentDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15,15,25,0.95)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {demoStats.departmentDistribution.map((dept) => (
                    <div key={dept.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span className="text-gray-400 truncate">{dept.name}</span>
                      <span className="text-gray-600 ml-auto">{dept.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
                  <p className="text-2xl font-bold text-white">{demoStats.totalStudents.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Students</p>
                </div>
              </Card>
            </motion.div>

            {/* Exam Schedule */}
            <motion.div variants={item}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    Exam Schedule
                  </h3>
                </div>
                <div className="space-y-3">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-red-400">{format(toDate(exam.date), 'dd')}</span>
                        <span className="text-[10px] text-red-400/70">{format(toDate(exam.date), 'MMM')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{exam.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant={exam.type === 'final' ? 'danger' : exam.type === 'midterm' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {exam.type}
                          </Badge>
                          <span className="text-[11px] text-gray-500">{exam.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{differenceInDays(toDate(exam.date), new Date())}d</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
