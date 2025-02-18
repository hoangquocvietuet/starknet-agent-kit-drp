import { ActionType, DRP, SemanticsType, Vertex } from '@ts-drp/object';

interface RequestMessage {
    peerId: string;
    id: string;
    content: string;
}

interface ResponseMessage {
    peerId: string;
    id: string;
    request_id: string;
    content: string;
}

export class ChatDRP implements DRP {
    semanticsType = SemanticsType.multiple;
    
    resolveConflicts = (_: Vertex[]) => {
        return {
            action: ActionType.Nop
        }
    }

    userMessages: RequestMessage[] = [];
    agentMessages: ResponseMessage[] = [];

    newUserMessage = (peerId: string, id: string, message: string) => {
        this.userMessages.push({
            peerId,
            id,
            content: message
        });
    }

    respondUserMessages = (peerId: string, id: string, request_id: string, content: string) => {
        this.agentMessages.push({
            peerId,
            id,
            request_id,
            content
        });
        return this.agentMessages.length.toString();
    }

    query_userMessage = (id: string) => {
        return this.userMessages.find(msg => msg.id === id);
    }

    query_reponseMessage = (id: string) => {
        return this.agentMessages.find(msg => msg.id === id);
    }

    query_reponseMessageByRequest = (id: string) => {
        return this.agentMessages.find(msg => msg.request_id === id);
    }

    query_allUserMessages = () => {
        return this.userMessages;
    }
}