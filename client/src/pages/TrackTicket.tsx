import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Ticket } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Package, Trash2, HeadphonesIcon, History, FileText, ImageIcon, Calendar, Clock, MapPin } from "lucide-react";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/TicketStatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="vale-gradient text-white py-16 px-4 mb-12 shadow-inner">
        <div className="container max-w-4xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight"
          >
            Acompanhar Solicitação
          </motion.h1>
          <p className="text-teal-50 text-lg">Consulte o status em tempo real pelo seu e-mail corporativo.</p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        <Card className="mb-12 border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Input 
                  type="email" 
                  placeholder="seu.nome@vale.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 pl-12 pr-4 border-slate-200 rounded-2xl focus:ring-primary text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <Button type="submit" className="h-14 px-10 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Consultar Chamados"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {searchEmail && !isLoading && (!tickets || tickets.length === 0) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200"
            >
              <div className="mb-6 mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <Inbox className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-slate-500">Verifique se o e-mail <span className="text-primary font-bold">{searchEmail}</span> está correto.</p>
            </motion.div>
          )}

          {tickets && tickets.length > 0 && (
            <div className="space-y-8">
              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden border-none shadow-lg rounded-3xl bg-white hover:shadow-xl transition-all duration-300">
                    <div className="vale-gradient h-2 w-full" />
                    <CardHeader className="p-8 pb-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2">
                              {ticket.type === "Compras" && <Package className="h-3 w-3 text-primary" />}
                              {ticket.type === "MID" && <Trash2 className="h-3 w-3 text-primary" />}
                              {ticket.type === "Chamados" && <HeadphonesIcon className="h-3 w-3 text-primary" />}
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{ticket.type}</span>
                            </div>
                            <span className="text-slate-400 font-bold text-sm">#{ticket.id.toString().padStart(6, '0')}</span>
                          </div>
                          <CardTitle className="text-2xl font-extrabold text-slate-800">{ticket.title}</CardTitle>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <TicketStatusBadge status={ticket.status} />
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Criado em {ticket.createdAt ? format(new Date(ticket.createdAt), "dd/MM/yy", { locale: ptBR }) : '-'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Prazos e Logística
                          </h4>
                          <div className="space-y-3 text-sm">
                            {ticket.type !== "MID" ? (
                              <>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                  <span className="text-slate-500">Visita Técnica:</span>
                                  <span className="font-bold text-primary">{ticket.deadlineVisit ? format(new Date(ticket.deadlineVisit), "dd/MM/yy HH:mm") : "Aguardando"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                  <span className="text-slate-500">Aprovação Orçamento:</span>
                                  <span className="font-bold text-primary">{ticket.deadlineQuote ? format(new Date(ticket.deadlineQuote), "dd/MM/yy HH:mm") : "Aguardando"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-slate-500">Previsão de Entrega:</span>
                                  <span className="font-bold text-primary">{ticket.deadlineDelivery ? format(new Date(ticket.deadlineDelivery), "dd/MM/yy HH:mm") : "Aguardando"}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500">Previsão de Busca:</span>
                                <span className="font-bold text-primary">{ticket.deadlinePickup ? format(new Date(ticket.deadlinePickup), "dd/MM/yy HH:mm") : "Aguardando"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> Tratativa Interna
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 min-h-[100px] shadow-inner">
                            <p className="text-sm italic text-slate-600 leading-relaxed">
                              {ticket.adminObservations || "Sua solicitação está sendo analisada pela nossa equipe. Em breve você receberá atualizações aqui."}
                            </p>
                          </div>
                          {ticket.adminPhotoUrl && (
                            <Button asChild variant="link" className="p-0 h-auto text-primary font-bold gap-2">
                              <a href={ticket.adminPhotoUrl} target="_blank" rel="noreferrer">
                                <ImageIcon className="h-4 w-4" /> Visualizar anexo anexado pela equipe
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-8 border-2 border-slate-100 rounded-2xl space-y-6">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-slate-700">{ticket.city}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{ticket.base}</span>
                          </div>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo do Chamado</p>
                          <p className="text-slate-600 leading-relaxed text-lg bg-slate-50/50 p-4 rounded-xl italic">
                            "{ticket.description}"
                          </p>
                        </div>

                        {ticket.items && (
                          <div className="pt-6 border-t border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Itens Solicitados</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(JSON.parse(ticket.items) as string[]).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                    {i + 1}
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
