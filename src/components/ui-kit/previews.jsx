// Re-exports of the real src/components/ui/* components for the /ui-kit sandbox.
// All implementations are now in their canonical files — promoted from Phase A sketches.
// componentDemos.jsx render() call sites are unchanged (same component signatures).

import { Sparkles, Inbox, FileText, Plus, Calendar, Eye, EyeOff, Upload } from 'lucide-react';

import Button          from '../ui/Button';
import Input           from '../ui/Input';
import Textarea        from '../ui/Textarea';
import Badge           from '../ui/Badge';
import Checkbox        from '../ui/Checkbox';
import Switch          from '../ui/Switch';
import RadioGroup      from '../ui/RadioGroup';
import Tooltip         from '../ui/Tooltip';
import Avatar          from '../ui/Avatar';
import Separator       from '../ui/Separator';
import Skeleton        from '../ui/Skeleton';
import Tabs            from '../ui/Tabs';
import Select          from '../ui/Select';
import Combobox        from '../ui/Combobox';
import DropZone        from '../ui/DropZone';
import Popover         from '../ui/Popover';
import Modal           from '../ui/Modal';
import Sheet           from '../ui/Sheet';
import Sidebar         from '../ui/Sidebar';
import ScrollArea      from '../ui/ScrollArea';
import { Table, TableHeader, TableRow, TableCell } from '../ui/Table';
import PlanCard        from '../ui/PlanCard';
import ChatBubble      from '../ui/ChatBubble';
import ChatMessageList from '../ui/ChatMessageList';
import ChatComposer    from '../ui/ChatComposer';

export {
  Button, Input, Textarea, Badge, Checkbox, Switch, RadioGroup, Tooltip, Avatar,
  Separator, Skeleton, Tabs, Select, Combobox, DropZone, Popover, Modal, Sheet,
  Sidebar, ScrollArea, Table, TableHeader, TableRow, TableCell, PlanCard,
  ChatBubble, ChatMessageList, ChatComposer,
};

// Registry for componentDemos.jsx dynamic lookup by name.
export const PREVIEWS = {
  Button, Input, Textarea, Badge, Checkbox, Switch, RadioGroup, Tooltip, Avatar,
  Separator, Skeleton, Tabs, Select, Combobox, DropZone, Popover, Modal, Sheet,
  Sidebar, ScrollArea, Table, TableHeader, TableRow, TableCell, PlanCard,
  ChatBubble, ChatMessageList, ChatComposer,
};

export const SAMPLE_ICONS = { Sparkles, Inbox, FileText, Plus, Calendar, Eye, EyeOff, Upload };
