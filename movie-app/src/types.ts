// src/types.ts

export type User = {
    name: string;
    email: string;
};

export type Genre = {
    id: number;
    slug: string;
    name: string;
};

export type Movie = {
    id: number;
    title: string;
    year: number;
    posterUrl?: string;
    genres: string[]; // 장르 slug 배열
};
