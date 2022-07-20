$(document).ready(function () {
    var dados = {
        "nova_atividade": { indice: '', documentID: '', title: '', data_entrega: '', topics: '', subject: '' },
        "login": { email: '', senha: '' },
        "cadastro": { name: '', email: '', senha: '', confirmSenha: '' },
        "isLogin": null,
        "autenticacao": 'Entrar',
        "errorMessage": '',
        Activities: [], // Vetor que armazena as atividades criadas
        Subjects: [], // Vetor que armazena os documentos da coleção disciplinas
        errors: []  // Vetor que armazena os erros na validação do formulário
    }

    Vue.filter('formataData', function (value) {
        //yyyy-mm-dd
        var data = new Date(value);
        data.setDate(data.getDate() + 1); //incrementa a data em um dia para mostrar corretamente (pode nao ser necessário)              
        dia = (data.getDate()).toString().padStart(2, '0'),
            mes = (data.getMonth() + 1).toString().padStart(2, '0'), //+1 pois no getMonth Janeiro começa com zero.                
            ano = data.getFullYear();
        return dia + "/" + mes + "/" + ano;
    });


    var vm = new Vue({
        el: '#app',
        data: dados,
        created() {
            //Observador do status de autenticação do usuário
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    var uid = user.uid;
                    console.log(uid)
                    //Usuário logado no app
                    this.isLogin = false;
                } else {
                    //Caso o usuário não esteja logado
                    this.isLogin = true;
                }
            });

            databaseRef.collection('ATIVIDADES').onSnapshot((snapshotChange) => {
                this.Activities = [];
                snapshotChange.forEach((doc) => {
                    this.Activities.push({
                        key: doc.data().docID,
                        title: doc.data().title,
                        date: doc.data().date,
                        subject: doc.data().subject,
                        topics: doc.data().topics,
                    })
                });
            })

            //Carrega as informações da coleção DISCIPLINAS
            databaseRef.collection('DISCIPLINAS').onSnapshot((snapshotChange) => {
                this.Subjects = [];
                snapshotChange.forEach((doc) => {
                    this.Subjects.push({
                        name: doc.data().name,
                    })
                });
            })

            this.cleanForm();
        },

        methods: {
            checkForm: function () {
                this.errors = [];

                if (this.nova_atividade.title && this.nova_atividade.data_entrega && this.nova_atividade.topics && this.nova_atividade.subject) {
                    return true;
                }

                if (!this.nova_atividade.title) {
                    this.errors.push('O título é obrigatório.');
                }

                if (!this.nova_atividade.data_entrega) {
                    this.errors.push('A data de entrega é obrigatória.');
                }


                if (!this.nova_atividade.topics) {
                    this.errors.push('Os tópicos são obrigatórios.');
                }


                if (!this.nova_atividade.subject) {
                    this.errors.push('A disciplina é obrigatória.');
                }
            },

            checkAuthForm: function () {
                if (this.login.email && this.login.senha) {
                    return true;
                } else {
                    alert('Preencha todos os campos!')
                }
            },

            paginaCadastro: function () {
                this.autenticacao = 'Cadastrar';
            },

            paginaLogin: function () {
                this.autenticacao = 'Entrar';
            },

            signIn: function () {
                var userEmail = this.login.email.trim();
                var userSenha = this.login.senha;

                console.log(userEmail + userSenha)

                if (this.checkAuthForm()) {
                    firebase.auth().signInWithEmailAndPassword(userEmail, userSenha)
                        .then((userCredential) => {
                            // Signed in
                            var user = userCredential.user;
                            console.log(user)
                        })
                        .catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;

                            //Chama a função que verifica erros no login
                            this.verificaSignInErros(errorCode);

                            console.log(errorCode);
                            console.log(errorMessage);
                        });
                }

                this.login.email = ''
                this.login.senha = ''
            },

            signOut: function () {
                if (window.confirm('Deseja sair da sua conta?')) {
                    firebase.auth().signOut().then(() => {
                        // Sign-out successful.
                    }).catch((error) => {
                        // An error happened.
                    });
                } else {
                    return;
                }
            },

            verificaSignInErros: function (errorMessage) {
                if (errorMessage == 'auth/user-not-found' && errorMessage == 'auth/wrong-password') {
                    alert('E-mail ou senha inválidos.')
                    //this.errorMessage = 'E-mail ou senha inválidos.'
                    //$('#exampleModalCenter').modal('show')
                } else if (errorMessage == 'auth/user-not-found' || errorMessage == 'auth/wrong-password') {
                    alert('E-mail ou senha inválidos.')
                    //this.errorMessage = 'E-mail ou senha inválidos.'
                    //$('#exampleModalCenter').modal('show')
                }
            },

            verificaSignUpErros: function (errorMessage) {
                if (errorMessage == 'auth/email-already-in-use') {
                    alert('Esse email já esta')
                } else if (errorMessage == 'auth/weak-password') {
                    alert('Sua senha precisa de pelo menos 6 caracteres')
                }
            },

            createActivity: function () {
                var title = this.nova_atividade.title;
                var data_entrega = this.nova_atividade.data_entrega.trim();
                var topics = this.nova_atividade.topics;
                var subject = this.nova_atividade.subject;
                var indice = this.nova_atividade.indice;
                var docId = this.nova_atividade.documentID;

                if (this.checkForm()) {
                    if (isNaN(parseInt(indice))) {
                        // Add a new document with a generated id.
                        var newActivityRef = databaseRef
                            .collection("ATIVIDADES")
                            .doc()
                            .withConverter(activityConverter);

                        newActivityRef.set(new Activity(
                            title,
                            data_entrega,
                            topics,
                            subject,
                            newActivityRef.id));

                        alert('Nova Atividade Cadastrada !');
                    } else {

                        var activityRef = databaseRef
                            .collection("ATIVIDADES")
                            .doc(docId)

                        activityRef.update({
                            title: title,
                            date: data_entrega,
                            topics: topics,
                            subject: subject,
                        })
                            .then(() => {
                                console.log("Document successfully updated!");
                            })
                            .catch((error) => {
                                // The document probably doesn't exist.
                                console.error("Error updating document: ", error);
                            });

                        alert('Atividade Alterada !');
                    }

                    //Chama o função que limpa o formulário
                    this.cleanForm();
                }
            },

            editActivity: function (param_index) {
                this.nova_atividade.indice = param_index
                this.nova_atividade.title = this.Activities[param_index].title;
                this.nova_atividade.data_entrega = this.Activities[param_index].date;
                this.nova_atividade.subject = this.Activities[param_index].subject;
                this.nova_atividade.topics = this.Activities[param_index].topics;
                this.nova_atividade.documentID = this.Activities[param_index].key;
            },

            deleteActivity: function (documentID) {
                if (window.confirm("Você realmente deseja excluir essa tarefa?")) {
                    databaseRef.collection("ATIVIDADES").doc(documentID).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                }
            },

            cleanForm: function () {
                this.nova_atividade.codigo = '';
                this.nova_atividade.title = '';
                this.nova_atividade.data_entrega = '';
                this.nova_atividade.topics = ''
                this.nova_atividade.subject = ''
                this.nova_atividade.indice = ''
                this.errors = [];
            }
        }
    })
});