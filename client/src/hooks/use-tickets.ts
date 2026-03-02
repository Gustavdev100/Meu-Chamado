import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Create local types inferred from the schema to avoid deep imports if they cause issues
type TicketInput = z.infer<typeof api.tickets.create.input>;
type TicketUpdateInput = z.infer<typeof api.tickets.update.input>;
export type TicketResponse = z.infer<typeof api.tickets.list.responses[200]>[0];

export function useTickets() {
  return useQuery({
    queryKey: [api.tickets.list.path],
    queryFn: async () => {
      const res = await fetch(api.tickets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao buscar chamados");
      const data = await res.json();
      return api.tickets.list.responses[200].parse(data);
    },
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: [api.tickets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tickets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Falha ao buscar chamado");
      const data = await res.json();
      return api.tickets.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TicketInput) => {
      const res = await fetch(api.tickets.create.path, {
        method: api.tickets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tickets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Falha ao criar chamado");
      }
      return api.tickets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
      toast({
        title: "Sucesso!",
        description: "Seu chamado foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível criar o chamado.",
      });
    }
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & TicketUpdateInput) => {
      const url = buildUrl(api.tickets.update.path, { id });
      const res = await fetch(url, {
        method: api.tickets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Falha ao atualizar chamado");
      }
      return api.tickets.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
      toast({
        title: "Atualizado",
        description: "O status do chamado foi atualizado.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar o chamado.",
      });
    }
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tickets.delete.path, { id });
      const res = await fetch(url, {
        method: api.tickets.delete.method,
        credentials: "include",
      });
      
      if (!res.ok && res.status !== 404) {
        throw new Error("Falha ao excluir chamado");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
      toast({
        title: "Excluído",
        description: "Chamado removido permanentemente.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível excluir.",
      });
    }
  });
}
