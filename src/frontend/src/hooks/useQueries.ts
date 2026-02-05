import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Message } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(userPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

// Direct Messages Queries
export function useGetDirectMessages(recipientPrincipal: Principal | null, enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['directMessages', recipientPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !recipientPrincipal) return [];
      return actor.getDirectMessages(recipientPrincipal);
    },
    enabled: !!actor && !actorFetching && !!recipientPrincipal && enabled,
    refetchInterval: enabled ? 3000 : false,
  });
}

export function useSendDirectMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendDirectMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['directMessages', variables.recipient.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Group Chat Queries
export function useCreateGroupChat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroupChat(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useAddParticipant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, participant }: { groupId: string; participant: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addParticipant(groupId, participant);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', variables.groupId] });
    },
  });
}

export function useGetGroupMessages(groupId: string | null, enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['groupMessages', groupId],
    queryFn: async () => {
      if (!actor || !groupId) return [];
      return actor.getGroupMessages(groupId);
    },
    enabled: !!actor && !actorFetching && !!groupId && enabled,
    refetchInterval: enabled ? 3000 : false,
  });
}

export function useSendGroupMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, content }: { groupId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendGroupMessage(groupId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
