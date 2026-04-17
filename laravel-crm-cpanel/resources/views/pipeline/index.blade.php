@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Pipeline Board</h2>
    <p class="footer-note">Drag a student card and drop it on another stage.</p>
    <div class="kanban" id="pipelineBoard">
        @foreach($columns as $name => $items)
            <div class="kanban-col dropzone" data-stage="{{ $name }}">
                <strong>{{ ucfirst($name) }} (<span data-count>{{ $items->count() }}</span>)</strong>
                <div class="kanban-list">
                    @foreach($items as $student)
                        <div class="kanban-item draggable-card" draggable="true" data-student="{{ $student->id }}">
                            <strong>{{ $student->full_name }}</strong>
                            <div class="footer-note">{{ $student->nationality ?: '-' }} | GPA {{ $student->gpa ?: '-' }}</div>
                            <div style="margin-top:6px;display:flex;gap:6px;">
                                <a class="tab" href="/students/{{ $student->id }}">Open</a>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>
</div>
<script>
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    let dragged = null;

    document.querySelectorAll('.draggable-card').forEach((card) => {
        card.addEventListener('dragstart', () => {
            dragged = card;
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    document.querySelectorAll('.dropzone').forEach((zone) => {
        zone.addEventListener('dragover', (event) => {
            event.preventDefault();
            zone.classList.add('kanban-hover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('kanban-hover'));
        zone.addEventListener('drop', async (event) => {
            event.preventDefault();
            zone.classList.remove('kanban-hover');
            if (!dragged) {
                return;
            }

            const list = zone.querySelector('.kanban-list');
            if (list) {
                list.appendChild(dragged);
            }
            updateCounts();

            const stage = zone.dataset.stage;
            const studentId = dragged.dataset.student;

            try {
                const response = await fetch('/pipeline/move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ student_id: studentId, stage }),
                });
                if (!response.ok) {
                    throw new Error('Move failed');
                }
            } catch (error) {
                window.location.reload();
            }
        });
    });

    function updateCounts() {
        document.querySelectorAll('.dropzone').forEach((zone) => {
            const count = zone.querySelectorAll('.draggable-card').length;
            const counter = zone.querySelector('[data-count]');
            if (counter) {
                counter.textContent = count;
            }
        });
    }
</script>
@endsection
