import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TrackingController {
    static trackingNotUpdate = async () => {
        const data: any = await prisma.$queryRaw`
        SELECT 
        DISTINCT me.code, o.nomor_resi , mo.name, o.updated_at,  TIMESTAMPDIFF(day, o.updated_at, CURRENT_TIMESTAMP()) as durasi
        FROM \`order\` o
        left join m_ekspedisi me  on me.id = o.ekspedisi_id 
        left join m_status_order mo on mo.id = o.status_order_id 
        left join m_group_status_order mgso on mgso.status_id = o.status_order_id 
        left join m_group_status mgs on mgs.id = mgso.group_status_id  
        WHERE 1=1
        AND o.deleted_at IS NULL
        AND o.nomor_resi IS NOT NULL
        AND o.nomor_resi <> ''
        and mgs.name not in ("RTS", "Received")
        and mo.name not in ("POD scan", "VOID_PICKUP", "POD - DELIVERED", "Completed", "POD - UNDELIVERED", "Returned to Sender", "Cancelled", "Delivered", "Cancel Order")
        AND TIMESTAMPDIFF(day, o.updated_at, CURRENT_TIMESTAMP()) > 0
        and me.code <> 'ninja'
        order by TIMESTAMPDIFF(day, o.updated_at, CURRENT_TIMESTAMP()) desc LIMIT 50`;
    
        for (let i = 0; i < data.length; i++) {
            const awb = data[i].nomor_resi;
            const ekspedisi = data[i].code;
            const status_name = data[i].name;
            const durasi = data[i].durasi;
            console.log(
                "🚀 ~ TrackingNotUpdate ~ awb:",
                `${i}. ${awb} - ${status_name} - ${ekspedisi} - ${durasi}`
            );

            const axios = require("axios");
            let dataTracking = {
                awb: awb,
            };

            try {
                const { dataX } = await axios.post(
                `http://localhost:8000/v1/api/${ekspedisi}/track-status`,
                dataTracking
                );
            } catch (error) {
                console.log("🚀 ~ TrackingNotUpdate ~ error:", error);
            }
        }
    }
}
