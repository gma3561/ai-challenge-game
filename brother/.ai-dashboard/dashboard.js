class Dashboard {
    constructor() {
        this.data = {};
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateLastUpdate();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
    }

    async loadData() {
        try {
            const response = await fetch('data.json');
            const raw = await response.json();
            this.data = this.adaptData(raw);
            this.updateDashboard();
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            this.loadDefaultData();
        }
    }

    loadDefaultData() {
        this.data = {
            lastUpdated: new Date().toISOString(),
            metrics: { totalTasks: 0, completed: 0, inProgress: 0, pending: 0 },
            sprint: { name: '-', start: '-', end: '-' },
            activities: [],
            fileChanges: []
        };
        this.updateDashboard();
    }

    adaptData(raw) {
        // lastUpdated
        const lastUpdated = raw.lastUpdated || new Date().toISOString();

        // metrics: 지원 형태 1) 객체형 {totalTasks, completed, inProgress, pending}
        //          지원 형태 2) 배열형 [{key,value}, ...]
        let metrics = { totalTasks: 0, completed: 0, inProgress: 0, pending: 0 };
        if (Array.isArray(raw.metrics)) {
            const map = Object.fromEntries(
                raw.metrics.map(m => [m.key, Number(m.value ?? 0)])
            );
            metrics = {
                totalTasks: Number(map.totalTasks ?? map.total ?? 0),
                completed: Number(map.completed ?? 0),
                inProgress: Number(map.inProgress ?? map.in_progress ?? 0),
                pending: Number(map.pending ?? 0)
            };
        } else if (raw.metrics && typeof raw.metrics === 'object') {
            metrics = {
                totalTasks: Number(raw.metrics.totalTasks ?? raw.metrics.total ?? 0),
                completed: Number(raw.metrics.completed ?? 0),
                inProgress: Number(raw.metrics.inProgress ?? raw.metrics.in_progress ?? 0),
                pending: Number(raw.metrics.pending ?? 0)
            };
        }

        // sprint
        const sprint = raw.sprint && typeof raw.sprint === 'object'
            ? {
                name: String(raw.sprint.name ?? '-'),
                start: String(raw.sprint.start ?? raw.sprint.startDate ?? '-'),
                end: String(raw.sprint.end ?? raw.sprint.endDate ?? '-')
            }
            : { name: '-', start: '-', end: '-' };

        return {
            lastUpdated,
            metrics,
            sprint,
            activities: Array.isArray(raw.activities) ? raw.activities : [],
            fileChanges: Array.isArray(raw.fileChanges) ? raw.fileChanges : []
        };
    }

    updateDashboard() {
        this.updateMetricsCards();
        this.updateSprintSummary();
        this.updateActivityLog();
        this.updateFileChanges();
    }

    updateMetricsCards() {
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = String(value);
        };
        setText('metric-total', this.data.metrics.totalTasks ?? 0);
        setText('metric-completed', this.data.metrics.completed ?? 0);
        setText('metric-inprogress', this.data.metrics.inProgress ?? 0);
        setText('metric-pending', this.data.metrics.pending ?? 0);
    }

    updateSprintSummary() {
        const nameEl = document.getElementById('sprint-name');
        const periodEl = document.getElementById('sprint-period');
        if (nameEl) nameEl.textContent = this.data.sprint?.name || '-';
        if (periodEl) {
            const s = this.data.sprint?.start || '-';
            const e = this.data.sprint?.end || '-';
            periodEl.textContent = `${s} ~ ${e}`;
        }
    }

    updateActivityLog() {
        const activityLog = document.getElementById('activityLog');
        if (!this.data.activities || this.data.activities.length === 0) {
            activityLog.innerHTML = '<p>활동 내역이 없습니다.</p>';
            return;
        }

        const activitiesHtml = this.data.activities
            .slice(-10)
            .map(activity => `
                <div class="activity-item">
                    <span>${activity.description}</span>
                    <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                </div>
            `).join('');

        activityLog.innerHTML = activitiesHtml;
    }

    updateFileChanges() {
        const fileChanges = document.getElementById('fileChanges');
        if (!this.data.fileChanges || this.data.fileChanges.length === 0) {
            fileChanges.innerHTML = '<p>변경된 파일이 없습니다.</p>';
            return;
        }

        const filesHtml = this.data.fileChanges
            .slice(-10)
            .map(file => `
                <div class="file-item">
                    <span>${file.path}</span>
                    <span class="file-time">${this.formatTime(file.timestamp)}</span>
                </div>
            `).join('');

        fileChanges.innerHTML = filesHtml;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('ko-KR');
    }

    updateLastUpdate() {
        const lastUpdate = document.getElementById('lastUpdate');
        lastUpdate.textContent = `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}`;
    }

    async refreshData() {
        await this.loadData();
        this.updateLastUpdate();
    }

    startAutoRefresh() {
        setInterval(() => {
            this.refreshData();
        }, 30000); // 30초마다 자동 새로고침
    }
}

// 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
