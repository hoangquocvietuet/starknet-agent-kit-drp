import { DRPNode } from "@ts-drp/node";
import { DRPObject } from "@ts-drp/object";
import { ChatDRP } from "./chat.drp.mjs";
import readline from 'readline';

let drpNode: DRPNode;
let drpObject: DRPObject;

async function init() {
    drpNode = new DRPNode({
        credential_config: {
            private_key_seed: Math.random().toString(36).substring(7),
        },
        network_config: {
            private_key_seed: Math.random().toString(36).substring(7),
            log_config: {
                level: 'silent',
            }
        }
    });
    await drpNode.start();
    console.log('peerId', drpNode.networkNode.peerId);
    drpObject = await drpNode.createObject({
        drp: new ChatDRP(),
        id: 'chat',
    });
}

async function getResponse(request: string) {
    const res = await fetch('https://starknet-agent-kit-production.up.railway.app/api/key/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'YOUR_SERVER_API_KEY'
        },
        body: JSON.stringify({
            request,
        }),
    }).then(async res => await res.json());    
    const output = JSON.parse(res.output[0].text);
    const output_text = output.output[0].text;
    return output_text;
}

async function processRequest(input: string) {
    const request_id = Math.random().toString(36).substring(7);
    (drpNode.objectStore.get('chat')!.drp as ChatDRP).newUserMessage(
        drpNode.networkNode.peerId,
        request_id,
        input
    );
    const response = await getResponse(input);
    (drpNode.objectStore.get('chat')!.drp as ChatDRP).respondUserMessages(
        drpNode.networkNode.peerId,
        Math.random().toString(36).substring(7),
        request_id,
        response
    );
    const responseMessage = (drpNode.objectStore.get('chat')!.drp as ChatDRP).query_reponseMessageByRequest(request_id);
    console.log('Response Message:', responseMessage);
    console.log('Response:', drpNode.objectStore.get('chat')!.hashGraph.getAllVertices());
}

async function main() {
    await init();
    const loop = () => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your message: ', async (input) => {
            const newObject = drpNode.objectStore.get('chat');
            if (newObject) drpObject = newObject;
            console.log('all peers', drpNode.networkNode.getAllPeers());
            await processRequest(input);
            if (input === 'exit') {
                rl.close();
            } else {
                rl.close();
                loop();  // Call main again to prompt for the next message
            }
        });
    }
    loop();
}

main();