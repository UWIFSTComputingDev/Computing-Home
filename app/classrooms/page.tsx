"use client";
import { Classroom } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ClassroomsPage() {
    const [search, setSearch] = useState<string>("");
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            const res = await fetch("/api/classrooms");

            if (res.ok)
                setClassrooms(await res.json())
        }

        fetchClassrooms();
    }, []);

    const normalizedSearch = search.trim().toLowerCase();
    const filteredClassrooms = classrooms.filter(classroom =>
        !normalizedSearch ||
        [classroom.code, classroom.title, classroom.directions]
            .some(value => value.toLowerCase().includes(normalizedSearch))
    );

    return (<div className="flex flex-col min-h-screen">
        <div className="flex justify-between bg-background dark:bg-background/20 py-8 px-4">
            <h2 className="text-lg font-bold">Classroom</h2>
            <input aria-label="Search classrooms" className="p-4 bg-accent/5 dark:bg-background/40" type="search" placeholder="Search classrooms..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default px-6">
            <table className="w-full text-sm text-left rtl:text-right text-body">
                <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Title
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Name on Timetable
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Description/Location
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClassrooms.map(classroom => <tr key={classroom.code} className="bg-neutral-primary border-b border-default">
                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                            {classroom.title}
                        </th>
                        <td className="px-6 py-4">
                            {classroom.code}
                        </td>
                        <td className="px-6 py-4">
                            {classroom.directions}
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    </div>);
}