import { useQuery } from "react-query";
import { CurrentRaid } from "../../types";

export const loadCurrentRaidData = () => useQuery<CurrentRaid>({
    queryKey: ['current-raid'],
    queryFn: async () => {
        const data = await fetch('http://localhost:8000/raid');
        const json = await data.json();
        return json;
    },
});
