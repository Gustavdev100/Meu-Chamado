import { useTickets, useUpdateTicket, useDeleteTicket, type TicketResponse } from "@/hooks/use-tickets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/TicketStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MoreHorizontal, 
  Trash2, 
  Inbox, 
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Dashboard() {
  const { data: tickets, isLoading, refetch, isRefetching } = useTickets();
  const { mutate: updateTicket } = useUpdateTicket();
  const { mutate: deleteTicket } = useDeleteTicket();
  
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  const handleStatusChange = (id: number, newStatus: string) => {
    updateTicket({ id, status: newStatus });
  };

  const confirmDelete = () => {
    if (ticketToDelete !== null) {
      deleteTicket(ticketToDelete);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="flex-1 w-full p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Painel de Chamados</h1>
          <p className="text-muted-foreground mt-1">Gerencie e acompanhe as solicitações de suporte.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isRefetching}
          className="bg-background shadow-sm hover:bg-muted"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/20 pb-4 border-b border-border/40">
          <CardTitle className="text-lg">Todos os Chamados</CardTitle>
          <CardDescription>Visualização em tempo real da fila de atendimento.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Sua fila está vazia no momento. Novos chamados aparecerão aqui.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Assunto</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: TicketResponse) => (
                  <TableRow key={ticket.id} className="group transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{ticket.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{ticket.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {ticket.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{ticket.contactName}</div>
                      <div className="text-xs text-muted-foreground">{ticket.contactEmail}</div>
                    </TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {ticket.createdAt ? format(new Date(ticket.createdAt), "d 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Atualizar Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'open')}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" /> Aberto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'in_progress')}>
                                  <Clock className="mr-2 h-4 w-4 text-amber-500" /> Em Andamento
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'resolved')}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Resolvido
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setTicketToDelete(ticket.id)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Chamado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={ticketToDelete !== null} onOpenChange={(open) => !open && setTicketToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o chamado 
              #{ticketToDelete?.toString().padStart(4, '0')} e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
