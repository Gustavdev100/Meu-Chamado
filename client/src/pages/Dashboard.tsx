import { useState } from "react";
import { useTickets, useUpdateTicket, useDeleteTicket } from "@/hooks/use-tickets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/TicketStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, Trash2, Inbox, RefreshCw, CheckCircle2, Clock, AlertCircle, Package, Trash, HeadphonesIcon, Settings2, FileText, Image as ImageIcon, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  const { data: tickets, isLoading, refetch, isRefetching } = useTickets();
  const { mutate: updateTicket } = useUpdateTicket();
  const { mutate: deleteTicket } = useDeleteTicket();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Meu Chamado - Admin</CardTitle>
            <CardDescription>Entre com sua senha para acessar a administração.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-primary">Acessar Painel</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    updateTicket({ id, status: newStatus });
  };

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updates: any = {
      adminObservations: formData.get("observations"),
      adminPhotoUrl: formData.get("photoUrl"),
      deadlineVisit: formData.get("deadlineVisit") ? new Date(formData.get("deadlineVisit") as string).toISOString() : null,
      deadlineQuote: formData.get("deadlineQuote") ? new Date(formData.get("deadlineQuote") as string).toISOString() : null,
      deadlineDelivery: formData.get("deadlineDelivery") ? new Date(formData.get("deadlineDelivery") as string).toISOString() : null,
      deadlinePickup: formData.get("deadlinePickup") ? new Date(formData.get("deadlinePickup") as string).toISOString() : null,
    };
    updateTicket({ id: selectedTicket.id, ...updates });
    setSelectedTicket(null);
  };

  return (
    <div className="flex-1 w-full p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Painel de Administração</h1>
          <p className="text-muted-foreground">Tratativas e monitoramento Vale S.A.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Solicitações Ativas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / Tipo</TableHead>
                <TableHead>Solicitação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket: any) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="font-bold text-xs uppercase text-primary">#{ticket.id} - {ticket.type}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-xs text-muted-foreground">{ticket.contactName}</div>
                  </TableCell>
                  <TableCell><TicketStatusBadge status={ticket.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}><Settings2 className="h-4 w-4 mr-2" /> Tratar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tratativa: #{selectedTicket?.id} - {selectedTicket?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Observação Admin</Label>
                <Textarea name="observations" defaultValue={selectedTicket?.adminObservations || ""} />
              </div>
              <div className="space-y-2">
                <Label>URL da Foto/Evidência</Label>
                <Input name="photoUrl" defaultValue={selectedTicket?.adminPhotoUrl || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedTicket?.type !== "MID" ? (
                <>
                  <div className="space-y-2">
                    <Label>Prazo de Visita</Label>
                    <Input type="datetime-local" name="deadlineVisit" defaultValue={selectedTicket?.deadlineVisit ? format(new Date(selectedTicket.deadlineVisit), "yyyy-MM-dd'T'HH:mm") : ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo de Orçamento</Label>
                    <Input type="datetime-local" name="deadlineQuote" defaultValue={selectedTicket?.deadlineQuote ? format(new Date(selectedTicket.deadlineQuote), "yyyy-MM-dd'T'HH:mm") : ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo de Entrega</Label>
                    <Input type="datetime-local" name="deadlineDelivery" defaultValue={selectedTicket?.deadlineDelivery ? format(new Date(selectedTicket.deadlineDelivery), "yyyy-MM-dd'T'HH:mm") : ""} />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Prazo de Busca</Label>
                  <Input type="datetime-local" name="deadlinePickup" defaultValue={selectedTicket?.deadlinePickup ? format(new Date(selectedTicket.deadlinePickup), "yyyy-MM-dd'T'HH:mm") : ""} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
