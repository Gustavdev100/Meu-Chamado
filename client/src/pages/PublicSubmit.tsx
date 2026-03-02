import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema } from "@shared/schema";
import { useCreateTicket } from "@/hooks/use-tickets";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FormValues = z.infer<typeof insertTicketSchema>;

export default function PublicSubmit() {
  const { mutate: createTicket, isPending } = useCreateTicket();

  const form = useForm<FormValues>({
    resolver: zodResolver(insertTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      contactName: "",
      contactEmail: "",
    },
  });

  function onSubmit(values: FormValues) {
    createTicket(values, {
      onSuccess: () => {
        form.reset();
      }
    });
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 bg-zinc-50/50 min-h-full">
      <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Como podemos ajudar?</h1>
          <p className="text-muted-foreground text-lg">Preencha o formulário abaixo para abrir um novo chamado de suporte.</p>
        </div>

        <Card className="border-border/60 shadow-lg shadow-black/5 rounded-2xl overflow-hidden glass-panel">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
            <CardTitle className="text-xl">Detalhes do Chamado</CardTitle>
            <CardDescription>
              Forneça o máximo de detalhes possível para agilizarmos o atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Seu Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" className="bg-background/50 h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Seu E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@exemplo.com" type="email" className="bg-background/50 h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-foreground/80">Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Erro ao acessar o sistema" className="bg-background/50 h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 h-11">
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o problema ou solicitação com detalhes..." 
                          className="min-h-[150px] resize-y bg-background/50 text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto h-12 px-8 rounded-xl font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Chamado
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
