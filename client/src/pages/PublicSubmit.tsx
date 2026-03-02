import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema, type InsertTicket } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, Trash2, HeadphonesIcon, Search } from "lucide-react";
import { Link } from "wouter";

const CITIES = {
  "São Luís": ["Base Porto", "Base Ferrovia", "Base Núcleo"],
  "Bacabeira": ["Base Bacabeira"],
  "Açailândia": ["Base Açailândia"],
  "Santa Inês": ["Base Santa Inês"],
  "Alto Alegre": ["Base Alto Alegre"],
  "Vitória do Mearim": ["Base Vitória do Mearim"]
} as const;

const TICKET_TYPES = [
  { id: "Compras", label: "Compras", icon: Package, description: "Solicitação de aquisição de materiais ou serviços." },
  { id: "MID", label: "MID (Descarte)", icon: Trash2, description: "Descarte de materiais ou resíduos que estão em algum lugar." },
  { id: "Chamados", label: "Chamados", icon: HeadphonesIcon, description: "Suporte técnico ou manutenção geral." }
] as const;

export default function PublicSubmit() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<InsertTicket>({
    resolver: zodResolver(insertTicketSchema),
    defaultValues: {
      type: "Chamados",
      status: "open",
      priority: "medium",
      title: "",
      description: "",
      city: "",
      base: "",
      contactName: "",
      contactEmail: "",
      midLocation: "",
      midMaterialType: "",
      itemQuantity: 1,
      itemCategory: ""
    }
  });

  const selectedCity = form.watch("city");

  const mutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      await apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Sua solicitação foi enviada com sucesso.",
      });
      form.reset();
      setSelectedType(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: error.message,
      });
    },
  });

  if (!selectedType) {
    return (
      <div className="container max-w-4xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">HelpDesk</h1>
          <p className="text-xl text-muted-foreground">Escolha o tipo de solicitação para continuar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TICKET_TYPES.map((type) => (
            <Card 
              key={type.id} 
              className="cursor-pointer hover:border-primary transition-all hover-elevate group"
              onClick={() => {
                setSelectedType(type.id);
                form.setValue("type", type.id);
                form.setValue("title", `Nova solicitação de ${type.id}`);
              }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{type.label}</CardTitle>
                <CardDescription className="pt-2">{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/track">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Acompanhar Solicitação
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => setSelectedType(null)}
      >
        &larr; Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nova Solicitação: {selectedType}</CardTitle>
          <CardDescription>Preencha os dados abaixo para abrir seu chamado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(CITIES).map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!selectedCity}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedCity ? "Selecione a base" : "Selecione uma cidade primeiro"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedCity && CITIES[selectedCity as keyof typeof CITIES].map(base => (
                            <SelectItem key={base} value={base}>{base}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Solicitante</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                      <FormLabel>E-mail de Contato</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              {selectedType === "MID" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <FormField
                    control={form.control}
                    name="midLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização do Resíduo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Galpão A, Pátio Sul" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="midMaterialType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Material</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Plástico, Madeira, Metal" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === "Compras" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <FormField
                    control={form.control}
                    name="itemCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria do Item</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Escritório, Limpeza, TI" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="itemQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || 0}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Solicitação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhadamente sua necessidade..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
