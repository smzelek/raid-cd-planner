import igira1 from './igira-page-1.json';
import igira2 from './igira-page-2.json';
import { http, HttpResponse } from 'msw';

const bossAbilityDamageEvents = [
    http.post('https://www.warcraftlogs.com/api/v2/client', async ({ request }) => {
        const body = await request.clone().text();
        if (body.trim().startsWith('query BossAbilityDamageEvents') && body.includes('startTime: 0')) {
            return HttpResponse.json(
                igira1 as any,
                {
                    status: 200
                }
            )
        }
        return HttpResponse.json(
            igira2 as any,
            {
                status: 200
            }
        )
    }),
];

export default bossAbilityDamageEvents;