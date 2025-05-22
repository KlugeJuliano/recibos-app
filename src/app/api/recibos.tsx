import {MemoryDatabase} from "@/app/database/memory_database";


export async function GET(request: Request) {
    const db = MemoryDatabase.getInstance();
    const recibos = db.getReceipts();
    return new Response(JSON.stringify(recibos), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(request: Request) {
    const db = MemoryDatabase.getInstance();
    const newRecibo = await request.json();
    db.addReceipt(newRecibo);
    return new Response(JSON.stringify(newRecibo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
}


