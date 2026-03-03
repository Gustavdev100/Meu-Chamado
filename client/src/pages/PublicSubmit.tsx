import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Package, Trash2, HeadphonesIcon, Search, Plus, X, ArrowRight, Building2, MapPin } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = {
  "São Luís": ["Base Porto", "Base Ferrovia", "Base Núcleo"],
  "Bacabeira": ["Base Bacabeira"],
  "Açailândia": ["Base Açailândia"],
  "Santa Inês": ["Base Santa Inês"],
  "Alto Alegre": ["Base Alto Alegre"],
  "Vitória do Mearim": ["Base Vitória do Mearim"]
} as const;

const TICKET_TYPES = [
  { id: "Compras", label: "Compras", icon: Package, description: "Solicitação de aquisição de materiais ou serviços.", color: "bg-blue-500" },
  { id: "MID", label: "MID (Descarte)", icon: Trash2, description: "Descarte de materiais ou resíduos que estão em algum lugar.", color: "bg-orange-500" },
  { id: "Chamados", label: "Chamados", icon: HeadphonesIcon, description: "Suporte técnico ou manutenção geral.", color: "bg-teal-600" }
] as const;

export default function PublicSubmit() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<any>({
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
      itemCategory: "",
      tempItems: [""]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tempItems"
  });

  const selectedCity = form.watch("city");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        items: data.tempItems ? JSON.stringify(data.tempItems.filter(Boolean)) : null
      };
      delete processedData.tempItems;
      await apiRequest("POST", "/api/tickets", processedData);
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Seu protocolo foi gerado com sucesso.",
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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <div className="vale-gradient text-white py-16 px-4 mb-12 shadow-inner">
        <div className="container max-w-4xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight"
          >
            Meu Chamado
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-teal-50 text-xl font-medium"
          >
            Canal Unificado de Solicitações Vale S.A.
          </motion.p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TICKET_TYPES.map((type, idx) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card 
                      className="group relative overflow-hidden h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-2xl bg-white"
                      onClick={() => {
                        setSelectedType(type.id);
                        form.setValue("type", type.id);
                        form.setValue("title", `Nova solicitação de ${type.id}`);
                      }}
                    >
                      <div className={`h-2 w-full ${type.color}`} />
                      <CardHeader className="text-center pt-8 pb-4">
                        <div className={`mx-auto mb-6 p-4 rounded-2xl ${type.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <type.icon className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">{type.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center px-6 pb-8">
                        <CardDescription className="text-slate-500 text-base leading-relaxed">
                          {type.description}
                        </CardDescription>
                      </CardContent>
                      <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-6 w-6 text-primary" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Link href="/track">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold gap-3 shadow-md">
                    <Search className="h-5 w-5" />
                    Acompanhar Minhas Solicitações
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Button 
                variant="ghost" 
                className="mb-8 hover:bg-slate-200 rounded-full font-bold text-slate-600" 
                onClick={() => setSelectedType(null)}
              >
                &larr; Voltar para seleção
              </Button>

              <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
                <div className="vale-gradient p-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      {selectedType === "Compras" && <Package className="h-8 w-8" />}
                      {selectedType === "MID" && <Trash2 className="h-8 w-8" />}
                      {selectedType === "Chamados" && <HeadphonesIcon className="h-8 w-8" />}
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold">Solicitação de {selectedType}</CardTitle>
                      <CardDescription className="text-teal-100 text-lg">
                        Preencha as informações detalhadamente.
                      </CardDescription>
                    </div>
                  </div>
                </div>

                <CardContent className="p-10">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" /> Cidade
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 border-slate-200 rounded-xl focus:ring-primary">
                                    <SelectValue placeholder="Selecione..." />
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
                              <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" /> Base
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!selectedCity}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 border-slate-200 rounded-xl focus:ring-primary">
                                    <SelectValue placeholder={selectedCity ? "Selecione..." : "Escolha a cidade"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {selectedCity && (CITIES as any)[selectedCity].map((base: string) => (
                                    <SelectItem key={base} value={base}>{base}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-slate-700">Nome do Solicitante</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome completo" className="h-12 border-slate-200 rounded-xl" {...field} />
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
                              <FormLabel className="font-bold text-slate-700">E-mail de Contato</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="nome@vale.com" className="h-12 border-slate-200 rounded-xl" {...field} />
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
                            <FormLabel className="font-bold text-slate-700">Urgência</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                                  <SelectValue placeholder="Prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixa - Sem pressa</SelectItem>
                                <SelectItem value="medium">Média - Necessário</SelectItem>
                                <SelectItem value="high">Alta - Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedType === "MID" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
                        >
                          <FormField
                            control={form.control}
                            name="midLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-primary">Onde estão os materiais?</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Galpão B2" className="h-12 bg-white rounded-xl" {...field} value={field.value || ""} />
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
                                <FormLabel className="font-bold text-primary">Tipo de Resíduo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Sucata ferrosa" className="h-12 bg-white rounded-xl" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {selectedType === "Compras" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-8 p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
                        >
                          <FormField
                            control={form.control}
                            name="itemCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-primary">Categoria da Compra</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: EPIS, Ferramentas" className="h-12 bg-white rounded-xl" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-4">
                            <FormLabel className="font-bold text-primary">Lista de Itens (Máx. 6)</FormLabel>
                            <div className="grid grid-cols-1 gap-4">
                              {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-3">
                                  <FormControl>
                                    <Input 
                                      className="h-12 bg-white rounded-xl"
                                      placeholder={`Descreva o item ${index + 1}`} 
                                      {...form.register(`tempItems.${index}` as const)}
                                    />
                                  </FormControl>
                                  {fields.length > 1 && (
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => remove(index)}
                                      className="h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                    >
                                      <X className="h-5 w-5" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {fields.length < 6 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => append("")}
                                className="mt-4 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 font-bold"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-700">Detalhes Adicionais</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Forneça mais informações se necessário..." 
                                className="min-h-[150px] border-slate-200 rounded-2xl p-4 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full h-16 text-lg font-bold rounded-2xl vale-gradient hover:opacity-95 shadow-xl transition-all duration-300" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Processando solicitação...
                          </>
                        ) : (
                          "Enviar Agora"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
