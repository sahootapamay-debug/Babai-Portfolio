import {
  Code, Database, FileSpreadsheet, BarChart3, TrendingUp, Calculator, Landmark,
  MessageSquare, Users, Lightbulb, Award, Briefcase, GraduationCap, Mail, Phone,
  MapPin, Globe, Github, Linkedin, Instagram, Twitter, MessageCircle, FileText,
  User, Building2, BookOpen, Target, PieChart, DollarSign, Banknote, PiggyBank,
  LineChart, Activity, Shield, CheckCircle, Star, Zap, Brain, Presentation,
  Layers, Settings as SettingsIcon, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2,
  Edit, Save, X, Download, Upload, Search, Bell, LogOut, LayoutDashboard, Image as ImageIcon,
  ExternalLink, Menu, ChevronRight, ChevronLeft, RefreshCw, Filter, MoreVertical,
  Copy, Eye as EyeIcon, Hash, Type, Palette, Clock, Calendar, Send, AlertCircle,
  Info, CheckCircle2, XCircle, Lock, Unlock, FolderOpen, Cloud, CloudOff, Wifi,
  WifiOff, ArrowLeft, ArrowRight, ArrowUpRight, Heart, Sparkles, FileUser, BadgeCheck,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Code, Database, FileSpreadsheet, BarChart3, TrendingUp, Calculator, Landmark,
  MessageSquare, Users, Lightbulb, Award, Briefcase, GraduationCap, Mail, Phone,
  MapPin, Globe, Github, Linkedin, Instagram, Twitter, MessageCircle, FileText,
  User, Building2, BookOpen, Target, PieChart, DollarSign, Banknote, PiggyBank,
  LineChart, Activity, Shield, CheckCircle, Star, Zap, Brain, Presentation,
  Layers, Settings: SettingsIcon, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2,
  Edit, Save, X, Download, Upload, Search, Bell, LogOut, LayoutDashboard, Image: ImageIcon,
  ExternalLink, Menu, ChevronRight, ChevronLeft, RefreshCw, Filter, MoreVertical,
  Copy, EyeIcon, Hash, Type, Palette, Clock, Calendar, Send, AlertCircle,
  Info, CheckCircle2, XCircle, Lock, Unlock, FolderOpen, Cloud, CloudOff, Wifi,
  WifiOff, ArrowLeft, ArrowRight, ArrowUpRight, Heart, Sparkles, BadgeCheck,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Award;
}

export const availableIcons = Object.keys(iconMap).sort();
