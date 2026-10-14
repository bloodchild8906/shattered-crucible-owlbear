import OBR from '@owlbear-rodeo/sdk';
import {CHANNEL,validRoll} from './obr.js';
OBR.onReady(()=>{OBR.broadcast.onMessage(CHANNEL,event=>{if(!validRoll(event.data))return;const d=event.data;OBR.notification.show(`${d.character} · ${d.label}: ${d.total} (${d.expression})`).catch(console.error);});});
