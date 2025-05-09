<?php
header('Content-Type: application/json');

$audiobooks = [
    [
        'id' => '1',
        'title' => 'The Midnight Library',
        'author' => 'Matt Haig',
        'narrator' => 'Carey Mulligan',
        'duration' => '8h 50m',
        'coverImage' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
        'description' => 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
        'audioUrl' => 'audio/the_silent_patient.mp3',
        'category' => 'Fiction',
        'featured' => true
    ],
    [
        'id' => '2',
        'title' => 'Atomic Habits',
        'author' => 'James Clear',
        'narrator' => 'James Clear',
        'duration' => '5h 35m',
        'coverImage' => 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
        'description' => 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.',
        'audioUrl' => '#',
        'category' => 'Self-Development',
        'featured' => true
    ],
    [
        'id' => '3',
        'title' => 'Project Hail Mary',
        'author' => 'Andy Weir',
        'narrator' => 'Ray Porter',
        'duration' => '16h 10m',
        'coverImage' => 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1878&auto=format&fit=crop&ixlib=rb-4.0.3',
        'description' => 'Ryland Grace is the sole survivor on a desperate mission - and if he fails, humanity and the earth itself will perish.',
        'audioUrl' => '#',
        'category' => 'Science Fiction',
        'featured' => false
    ],
    [
        'id' => '4',
        'title' => 'The Psychology of Money',
        'author' => 'Morgan Housel',
        'narrator' => 'Chris Hill',
        'duration' => '5h 48m',
        'coverImage' => 'https://media.licdn.com/dms/image/v2/D4D12AQFp56iKRCdxkg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1660860586437?e=2147483647&v=beta&t=6lYPuKmCixD6YQl4g2sIn5pERQ1xqxR1AlI77ROB1Uo',
        'description' => 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know.',
        'audioUrl' => '#',
        'category' => 'Finance',
        'featured' => true
    ],
    [
        'id' => '5',
        'title' => 'Dune',
        'author' => 'Frank Herbert',
        'narrator' => 'Scott Brick',
        'duration' => '21h 2m',
        'coverImage' => 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3',
        'description' => 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
        'audioUrl' => '#',
        'category' => 'Science Fiction',
        'featured' => false
    ],
    [
        'id' => '6',
        'title' => 'The Silent Patient',
        'author' => 'Alex Michaelides',
        'narrator' => 'Jack Hawkins',
        'duration' => '8h 43m',
        'coverImage' => 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3',
        'description' => 'Alicia Berenson\'s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house.',
        'audioUrl' => '#',
        'category' => 'Thriller',
        'featured' => true
    ]
];

echo json_encode($audiobooks);
?>