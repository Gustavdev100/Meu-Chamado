import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Ticket } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Package, Trash2, HeadphonesIcon, History } from "lucide-react";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/TicketStatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TrackTicket() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    enabled: !!searchEmail,
    select: (data) => data.filter(t => t.contactEmail.toLowerCase() === searchEmail.toLowerCase()),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email);
  };

  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4 flex items-center justify-center gap-3">
          <History className="h-10 w-10" />
          Acompanhar Solicitação
        </h1>
        <p className="text-xl text-muted-foreground">Consulte o status das suas solicitações pelo seu e-mail.</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input 
              type="email" 
              placeholder="Digite seu e-mail cadastrado" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchEmail && !isLoading && (!tickets || tickets.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-lg">Nenhuma solicitação encontrada para o e-mail: <span className="font-semibold">{searchEmail}</span></p>
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ticket.type === "Compras" && <Package className="h-4 w-4 text-primary" />}
                      {ticket.type === "MID" && <Trash2 className="h-4 w-4 text-primary" />}
                      {ticket.type === "Chamados" && <HeadphonesIcon className="h-4 w-4 text-primary" />}
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{ticket.type}</span>
                    </div>
                    <CardTitle className="text-xl">{ticket.title}</CardTitle>
                    <CardDescription>#{ticket.id.toString().padStart(4, '0')} - Aberto em {ticket.createdAt ? format(new Date(ticket.createdAt), "d 'de' MMM, yyyy", { locale: ptBR }) : '-'}</CardDescription>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Localização</p>
                    <p className="font-medium">{ticket.city} - {ticket.base}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Prioridade</p>
                    <TicketPriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-background">
                  <p className="text-muted-foreground mb-2 text-xs uppercase font-bold tracking-widest">Descrição</p>
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
