import 'cypress-file-upload';

describe('Task Page', () =>{
    if('bisa akses halaman task', () => {
        cy.visit('/tasks.html');
    });

    describe("Error di Task Page", ()=>{
        it('Gagal mendapatkan daftar task ketika tidak ditemukan', () => {
            cy.intercept('localhost:7002/list', '').as('getTask');
            cy.visit('/tasks.html');
            cy.wait('@getTask');
            cy.get('#error-text').should('contain.text', 'gagal memuat daftar pekerjaan');
        });
        it('Gagal mendapatkan daftar worker ketika tidak ditemukan', () => {
            cy.intercept('localhost:7001/list', '').as('getWorker');
            cy.visit('/tasks.html');
            cy.wait('@getWorker');
            cy.get('#error-text').should('contain.text', 'gagal menampilkan pekerja');
        });
        it('Submit task baru tapi form tidak lengkap', () => {
            cy.intercept('localhost:7001/list', { fixture: 'workerTask', content}).as('getWorker');
            cy.intercept('localhost:7002/add', { id:3, job: 'Nyuci', done: false, cancelled: false, addedAt: "2021-02-09T18:00:54.697+0000",attachment: "", 
            assignee: {}}).as('regisTask');
            cy.visit('/tasks.html');
            cy.wait('@getWorker');
            cy.get('#job').type('Nyuci');
            cy.get('#form').submit();
            cy.get('#error-text').should('contain.text', 'form isian tidak lengkap!');
        });
    });

    describe("Daftar Tugas", () =>{
        beforeEach(() => {
            cy.intercept('localhost:7001/list', { fixture: 'workerTask', content}).as('getWorker');
            cy.intercept('localhost:7002/list', { fixture: 'task' }).as('getTask');
        });

        it('seharusnya bisa menampilkan pekerjaan yang ada', () => {
            cy.visit('/tasks.html');
            cy.wait('@getWorker');  
            cy.wait('@getTask');
            cy.get('#list').children().as('taskList')
            cy.get('@taskList').should('have.length',2);
            cy.get('@taskList').eq(0).should('contain.text','Makan');
            cy.get('@taskList').eq(1).should('contain.text','Belajar');
        });

        it('seharusnya ketika tombol "Selesai" d klik, muncul text "sudah selesai"', () => {
            cy.intercept('PUT', 'localhost:7002/done', {id:2, job: 'Belajar', done: true,cancelled: false,addedAt: "2021-02-09T15:00:54.697+0000",attachment: "belajar.txt", assignee: 2});
            cy.visit('/tasks.html');
            cy.wait('@getWorker'); 
            cy.wait('@getTask');
            cy.get('#list').children().eq(1).as('belajar');
            cy.get('@belajar').should('not.contain.text', 'sudah selesai');
            cy.get('@belajar').contains('selesai').click();
            cy.get('@belajar').should('contain.text', 'sudah selesai');
        });

        it('seharusnya ketika tombol "Batal" d klik, maka tugas tersebut hilang dari daftar tugas', () => {
            cy.intercept('PUT', 'localhost:7002/cancel', {id:1, job: 'Makan', done: false,cancelled: false,addedAt: "2021-02-09T14:19:54.697+0000",attachment: "makan.txt", assignee: 1});
            cy.visit('/tasks.html');
            cy.wait('@getWorker'); 
            cy.wait('@getTask');
            cy.get('#list').children().as('taskList')
            cy.get('#list').children().eq(0).as('makan');
            cy.get('@taskList').should('have.length',2);
            cy.get('@makan').contains('batal').click();
            cy.get('@taskList').should('have.length',1);
        });
    });

    describe("Menambahkan Task Baru", ()=>{
        beforeEach(() => {
            cy.intercept('localhost:7001/list', { fixture: 'workerTask', content}).as('getWorker');
            cy.intercept('localhost:7002/list', { fixture: 'task' }).as('getTask');
        });
        it('seharusnya ketika semua form terisi dan klik tombol "kirim" maka jumlah task bertambah', () => {
            cy.intercept('localhost:7002/add', { id:3, job: 'Main Game', done: false, cancelled: false, addedAt: "2021-02-09T18:00:54.697+0000",attachment: "game.txt", 
            assignee: {"id":2, "name": "Susi", "age": 25, "bio": "saya cewek", "address": "Jl in aja dulu 2", "photo": "456.jpg"}}).as('regisTask');
            cy.visit('/tasks.html');
            cy.wait('@getWorker'); 
            cy.wait('@getTask');
            cy.get('#job').type('Main Game');
            cy.get('#assignee').type(2);
            cy.get('#attachment').attachFile('game.txt');
            cy.get('#form').submit();
            cy.wait('@regisTask');
            cy.get('#list').children().as('taskList');
            cy.get('@taskList').should('have.length', 3);
            cy.get('@taskList').eq(2).should('contain.text', 'Main Game');
        });
    });

    
});