import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  switch (status) {
    case 'resolved':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-2.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolvido
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 py-1 px-2.5">
          <Clock className="w-3.5 h-3.5" />
          Em Andamento
        </Badge>
      );
    case 'open':
    default:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 py-1 px-2.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Aberto
        </Badge>
      );
  }
}

interface TicketPriorityBadgeProps {
  priority: string;
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  switch (priority) {
    case 'high':
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 font-medium">Alta</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium">Média</Badge>;
    case 'low':
    default:
      return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100 font-medium">Baixa</Badge>;
  }
}
