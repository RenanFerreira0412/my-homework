$(document).ready(function () {
    var dados = {
        "nova_atividade": { indice: '', documentID: '', title: '', data_entrega: '', topics: '', subject: '' },
        "login": { email: '', senha: '' },
        "cadastro": { name: '', email: '', senha: '', confirmSenha: '' },
        "nova_disciplina": { nome: '', tutor: '' },
        "editDadosUser": { phone: '', school: '', serie: '' },
        "titulo": '',
        "actionButton": '',
        "toggleButton": '',
        "authPage": null,
        "isLogin": true,
        "errorMessage": false,
        "message": '',
        "filter": '',
        "userInfo": { userEmail: '', imagePath: '', userName: '', userPhone: '', userSerie: '', userSchool: '' },
        "snackbarAttrs": { id: 'snackbar' },
        Activities: [], // Vetor que armazena as atividades criadas
        Subjects: [], // Vetor que armazena os documentos da coleção disciplinas
        userData: [], // Vetor que armazena os documentos da coleção usuários
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

    // global
    Vue.use(window.vuelidate.default);

    const { required, maxLength, minValue, numeric, minLength, sameAs, sameAsPassword } = window.validators

    var vm = new Vue({
        el: '#app',
        data: dados,
        validations: {
            nova_atividade: {
                title: {
                    required,
                    maxLength: maxLength(200)
                },

                data_entrega: {
                    minValue: value => value > new Date().toISOString()
                },

                subject: {
                    required
                }
            },

            nova_disciplina: {
                nome: {
                    required,
                    maxLength: maxLength(100)
                }
            }
        },

        methods: {
            listActivity(userId) {
                databaseRef.collection('ATIVIDADES').where("userID", "==", userId).onSnapshot((snapshotChange) => {
                    this.Activities = [];
                    snapshotChange.forEach((doc) => {
                        //console.log(doc.data().docID)
                        this.Activities.push({
                            key: doc.data().docID,
                            title: doc.data().title,
                            date: doc.data().date,
                            subject: doc.data().subject,
                            topics: doc.data().topics,
                        })
                    });
                })
            },

            getValue: function (filterText) {
                var user = authRef.currentUser;
                //console.log(filterText)

                var filter = filterText.toLowerCase();
                console.log(filter)

                if (filterText != "") {
                    databaseRef.collection('ATIVIDADES').where("userID", "==", user.uid).where("titleLowerCase", "==", filter).onSnapshot((snapshotChange) => {
                        this.Activities = [];
                        snapshotChange.forEach((doc) => {
                            //console.log(doc.data().docID)
                            this.Activities.push({
                                key: doc.data().docID,
                                title: doc.data().title,
                                date: doc.data().date,
                                subject: doc.data().subject,
                                topics: doc.data().topics,
                            })
                        });
                    })
                } else {
                    databaseRef.collection('ATIVIDADES').where("userID", "==", user.uid).onSnapshot((snapshotChange) => {
                        this.Activities = [];
                        snapshotChange.forEach((doc) => {
                            //console.log(doc.data().docID)
                            this.Activities.push({
                                key: doc.data().docID,
                                title: doc.data().title,
                                date: doc.data().date,
                                subject: doc.data().subject,
                                topics: doc.data().topics,
                            })
                        });
                    })
                }
            },

            signOut: function () {
                var logout = window.confirm('Deseja sair da sua conta?');

                if (logout) {
                    firebase.auth().signOut().then(() => {
                        // Sign-out successful.
                    }).catch((error) => {
                        // An error happened.
                    });
                }
            },

            createActivity(v) {
                var title = this.nova_atividade.title;
                var data_entrega = this.nova_atividade.data_entrega.trim();
                var topics = this.nova_atividade.topics;
                var subject = this.nova_atividade.subject;
                var indice = this.nova_atividade.indice;
                var docId = this.nova_atividade.documentID;

                var user = authRef.currentUser;

                console.log(user.uid)

                if (!v.nova_atividade.title.$invalid && !v.nova_atividade.data_entrega.$invalid && !v.nova_atividade.subject.$invalid) {
                    if (isNaN(parseInt(indice))) {
                        // Add a new document with a generated id.
                        var newActivityRef = databaseRef
                            .collection("ATIVIDADES")
                            .doc()
                            .withConverter(activityConverter);

                        newActivityRef.set(new Activity(
                            title,
                            title.toLowerCase(),
                            data_entrega,
                            topics,
                            subject,
                            newActivityRef.id,
                            user.uid));

                        this.message = 'Nova Atividade Cadastrada !';
                        this.showSnackbar();
                    } else {

                        var activityRef = databaseRef
                            .collection("ATIVIDADES")
                            .doc(docId)

                        activityRef.update({
                            title: title,
                            titleLowerCase: title.toLowerCase(),
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

                        this.message = 'Atividade Alterada !';
                        this.showSnackbar();
                    }

                    //Chama o função que limpa o formulário
                    this.cleanForm();

                    $('#nav-activity-tab').tab('show') // Navega para a página de Atividades
                } else {
                    this.message = 'Preencha o formulário corretamente.';
                    this.showSnackbar();
                }
            },

            addDisciplina(v) {
                var input_nome = this.nova_disciplina.nome;
                var input_tutor = this.nova_disciplina.tutor.trim();
                var user = authRef.currentUser;

                if (!v.nova_disciplina.nome.$invalid) {

                    databaseRef.collection("DISCIPLINAS").add({
                        nome: input_nome,
                        tutor: input_tutor,
                        userId: user.uid
                    })
                        .then((docRef) => {
                            console.log("Document written with ID: ", docRef.id);
                        })
                        .catch((error) => {
                            console.error("Error adding document: ", error);
                        });

                    this.cleanFormDisciplina();

                } else {
                    this.message = 'Preencha o formulário corretamente.';
                    this.showSnackbar();
                }

            },

            editActivity: function (param_index) {
                this.nova_atividade.indice = param_index
                this.nova_atividade.title = this.Activities[param_index].title;
                this.nova_atividade.data_entrega = this.Activities[param_index].date;
                this.nova_atividade.subject = this.Activities[param_index].subject;
                this.nova_atividade.topics = this.Activities[param_index].topics;
                this.nova_atividade.documentID = this.Activities[param_index].key;

                $('#nav-form-tab').tab('show') // Navega para o formulário  
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

            navegaParaForm: function () {
                $('#nav-form-tab').tab('show') // Navega para o formulário 
            },

            updateDadosUser: function () {
                var input_phone = this.editDadosUser.phone;
                var input_school = this.editDadosUser.school.trim();
                var input_serie = this.editDadosUser.serie.trim();


            },

            showSnackbar: function () {
                var snackbar = document.getElementById(this.snackbarAttrs.id);

                snackbar.className = "show";
                setTimeout(function () { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
            },

            cleanFormDisciplina: function () {
                this.nova_disciplina.nome = '';
                this.nova_disciplina.tutor = '';
            },

            cleanForm: function () {
                this.nova_atividade.codigo = '';
                this.nova_atividade.title = '';
                this.nova_atividade.data_entrega = '';
                this.nova_atividade.topics = ''
                this.nova_atividade.subject = ''
                this.nova_atividade.indice = ''
            }
        },

        created() {
            //Observador do status de autenticação do usuário
            authRef.onAuthStateChanged((user) => {
                if (user) {
                    var uid = user.uid;
                    console.log(uid)

                    this.listActivity(uid);

                    //this.userInfo.userEmail = user.email;
                    this.userInfo.imagePath = user.photoURL ? user.photoURL : 'ASSETS/IMG/user-avatar.png';

                    //Carrega as informações da coleção USUARIOS
                    databaseRef.collection('USUARIOS').where("id", "==", uid).onSnapshot((snapshotChange) => {
                        this.userData = [];
                        snapshotChange.forEach((doc) => {
                            this.userData.push({
                                nome: doc.data().name,
                                email: doc.data().email,
                                phone: doc.data().phone ? doc.data().phone : 'Informação não cadastrada !',
                                school: doc.data().school ? doc.data().school : 'Informação não cadastrada !',
                                serie: doc.data().serie ? doc.data().serie : 'Informação não cadastrada !',
                            })
                        });
                    })

                    //Carrega as informações da coleção DISCIPLINAS
                    databaseRef.collection('DISCIPLINAS').where("userId", "==", uid).onSnapshot((snapshotChange) => {
                        this.Subjects = [];
                        snapshotChange.forEach((doc) => {
                            this.Subjects.push({
                                nome: doc.data().nome,
                            })
                        });
                    })

                    //Usuário logado no app
                    this.authPage = false;
                } else {
                    //Caso o usuário não esteja logado
                    this.authPage = true;
                }
            });

            this.cleanForm();
        },
    });

    var vm2 = new Vue({
        el: '#auth',
        data: dados,
        validations: {
            login: {
                email: {
                    required
                },

                senha: {
                    required,
                    minLength: minLength(6)
                }
            },

            cadastro: {
                name: {
                    required,
                    maxLength: maxLength(100)
                },

                email: {
                    required
                },

                senha: {
                    required,
                    minLength: minLength(6)
                },

                confirmSenha: {
                    sameAsPassword: sameAs('senha')
                }
            }
        },

        methods: {
            setFormAction: function (acao) {
                this.isLogin = acao;

                if (this.isLogin) { //Apresenta informações e campos da tela de login
                    this.titulo = 'Por Favor, preencha os seus dados para entrar na sua conta';
                    this.actionButton = 'Entrar';
                    this.toggleButton = 'Ainda não tem conta? Cadastre-se agora.';
                } else { // Caso contrário, apresenta os campos da tela de cadastro
                    this.titulo = 'Crie sua conta';
                    this.actionButton = 'Cadastrar';
                    this.toggleButton = 'Voltar ao Login.';
                }

            },

            authBtn: function (v) {
                var input_login_email = this.login.email.trim();
                var input_login_senha = this.login.senha.trim();

                var input_cadastro_email = this.cadastro.email.trim();
                var input_cadastro_senha = this.cadastro.senha.trim();
                var input_cadastro_name = this.cadastro.name;
                //var input_cadastro_confirmSenha = this.cadastro.confirmSenha.trim();

                if (this.isLogin) {

                    if (!v.login.email.$invalid && !v.login.senha.$invalid) {
                        authRef.signInWithEmailAndPassword(input_login_email, input_login_senha)
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

                        //Limpa o formulário de login
                        this.cleanFormLogin();

                    } else {
                        alert('Preencha corretamente o formulário !!!')
                    }

                } else {
                    if (!v.cadastro.email.$invalid && !v.cadastro.senha.$invalid && !v.cadastro.name.$invalid && !v.cadastro.confirmSenha.$invalid) {
                        authRef.createUserWithEmailAndPassword(input_cadastro_email, input_cadastro_senha)
                            .then((userCredential) => {
                                // Signed in
                                var user = userCredential.user;
                                console.log(user)

                                //Chama a função que cria a coleção dos usuários
                                this.addUser(input_cadastro_name, input_cadastro_email, user.uid)
                            })
                            .catch((error) => {
                                var errorCode = error.code;
                                var errorMessage = error.message;

                                //Chama a função que verifica erros de cadastro
                                this.verificaSignUpErros(errorCode)

                                console.log(errorCode);
                                console.log(errorMessage);
                            });

                        //Limpa o formulário de cadastro
                        this.cleanFormCadastro();
                    } else {
                        alert('Preencha corretamente o formulário !!!')
                    }
                }
            },

            googleLogin: function () {
                var provider = new firebase.auth.GoogleAuthProvider();

                authRef
                    .signInWithPopup(provider)
                    .then((result) => {
                        ///** @type {firebase.auth.OAuthCredential} */
                        var credential = result.credential;

                        // This gives you a Google Access Token. You can use it to access the Google API.
                        var token = credential.accessToken;
                        // The signed-in user info.
                        var user = result.user;
                        // ...
                    }).catch((error) => {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorCode)
                        console.log(errorMessage)
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                        // ...
                    });

            },

            verificaSignInErros: function (errorMessage) {
                switch (errorMessage) {
                    case 'auth/user-not-found':
                        alert('E-mail inválido.');
                        break;
                    case 'auth/wrong-password':
                        alert('Senha inválida.');
                        break;
                    default:
                        console.log('Algo deu errado.');
                }
            },

            verificaSignUpErros: function (errorMessage) {
                switch (errorMessage) {
                    case 'auth/email-already-in-use':
                        alert('Esse email já está sendo usado.')
                        break;
                    case 'auth/weak-password':
                        alert('Sua senha precisa ter pelo menos 6 caracteres')
                        break;
                    default:
                        console.log('Algo deu errado');
                }
            },

            addUser: function (name, email, userId) {
                databaseRef.collection("USUARIOS").add({
                    name: name,
                    email: email,
                    phone: '',
                    serie: '',
                    school: '',
                    id: userId
                })
                    .then((docRef) => {
                        console.log("Document written with ID: ", docRef.id);
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error);
                    });
            },

            cleanFormLogin: function () {
                this.login.email = ''
                this.login.senha = ''
            },

            cleanFormCadastro: function () {
                this.cadastro.email = '';
                this.cadastro.senha = '';
                this.cadastro.name = '';
                this.cadastro.confirmSenha = '';
            },
        }
    });

    vm2.setFormAction(true)
});