import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Ticket } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Package, Trash2, HeadphonesIcon, History, FileText, ImageIcon, Calendar } from "lucide-react";
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
          Meu Chamado
        </h1>
        <p className="text-xl text-muted-foreground italic">Acompanhe suas solicitações Vale S.A.</p>
      </div>

      <Card className="mb-8 border-primary/20">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input 
              type="email" 
              placeholder="Digite seu e-mail para ver apenas seus chamados" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Consultar
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchEmail && !isLoading && (!tickets || tickets.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-lg">Nenhuma solicitação encontrada para o e-mail: <span className="font-semibold text-primary">{searchEmail}</span></p>
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden border-l-8 border-l-primary shadow-lg">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ticket.type === "Compras" && <Package className="h-4 w-4 text-primary" />}
                      {ticket.type === "MID" && <Trash2 className="h-4 w-4 text-primary" />}
                      {ticket.type === "Chamados" && <HeadphonesIcon className="h-4 w-4 text-primary" />}
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{ticket.type}</span>
                    </div>
                    <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                    <CardDescription className="font-bold">Protocolo: #{ticket.id.toString().padStart(6, '0')}</CardDescription>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-xl border">
                    <p className="text-primary font-bold text-xs uppercase mb-2">Prazos e Tratativas</p>
                    <div className="space-y-2 text-sm">
                      {ticket.type !== "MID" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Visita:</span>
                            <span className="font-medium text-primary">{ticket.deadlineVisit ? format(new Date(ticket.deadlineVisit), "dd/MM/yy HH:mm") : "A definir"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orçamento:</span>
                            <span className="font-medium text-primary">{ticket.deadlineQuote ? format(new Date(ticket.deadlineQuote), "dd/MM/yy HH:mm") : "A definir"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entrega:</span>
                            <span className="font-medium text-primary">{ticket.deadlineDelivery ? format(new Date(ticket.deadlineDelivery), "dd/MM/yy HH:mm") : "A definir"}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Busca:</span>
                          <span className="font-medium text-primary">{ticket.deadlinePickup ? format(new Date(ticket.deadlinePickup), "dd/MM/yy HH:mm") : "A definir"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-xl border">
                    <p className="text-primary font-bold text-xs uppercase mb-2">Observações Internas</p>
                    <p className="text-sm italic text-muted-foreground">
                      {ticket.adminObservations || "Sem observações no momento."}
                    </p>
                    {ticket.adminPhotoUrl && (
                      <a href={ticket.adminPhotoUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center text-xs text-primary font-bold hover:underline">
                        <ImageIcon className="h-3 w-3 mr-1" /> Ver Foto em Anexo
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 border-2 border-primary/10 rounded-xl bg-background">
                  <p className="text-primary font-bold text-xs uppercase mb-2">Sua Solicitação</p>
                  <p className="text-sm leading-relaxed">{ticket.description}</p>
                  {ticket.items && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-bold text-muted-foreground mb-2">Itens Solicitados:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {(JSON.parse(ticket.items) as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
