
const { createApp } = Vue

const clearLabel = ( txt ) => {
    txt = txt.trim()
    txt = txt.replace(/\{/g, '')
    txt = txt.replace(/\[/g, '')
    txt = txt.replace(/\s/g, '')
    txt = txt.replace(/:/g, '')
    return txt
}

const forEachObject = ( obj ) => {
    let html = ''
    const keys_ = Object.keys( obj )
    for( k in keys_ ){
        let key_ = keys_[ k ]
        //console.log( 'KEY = '+key_ ); console.log( 'Tipo = '+typeof( obj[key_] ) )

        if( typeof( obj[key_] ) != 'object' )
        {
            html = setForm( key_, obj, html )
        }
        else{ //console.info('Es Object...............')
            if( obj[ key_ ] != null ){ // Si valor es Diferente de null
                const classInit = ( obj[ key_ ].length !== undefined ) ? 'new-array': 'new-object'
                const classEnd = ( obj[ key_ ].length !== undefined ) ? 'array-end': 'object-end'
                let typeInit = '{', typeEnd = '}'
                if( obj[ key_ ].length !== undefined ){
                    typeInit = '['
                    typeEnd = ']'
                }
                html += `<div class="${classInit}"> ${key_} ${typeInit} </div>`
                html += forEachObject( obj[key_] ) + ` <div class="${classEnd}"> ${typeEnd} </div>`
            }
            else{
                const objNull = {}
                objNull[ key_ ] = null
                html = setForm( key_, objNull, html )
            }
        }
    }
    return html
}

const setForm = ( name, obj, html ) => {
    const classNull = ( obj[name] == null )? 'null' : ''
    const classNumber = ( typeof( obj[name] ) == 'number' ) ? 'number_' : ''
    html += `<div class="mb-1 row">
        <label for="${name}" class="col-sm-6 col-form-label col-form-label-sm">
            ${name}: 
        </label>
        <div class="col-sm-6">
            <input type="text" class="form-control form-control-sm ${classNull} ${classNumber} " 
            name="${name}" value="${obj[name]}" />
        </div>
    </div>`
    return html
}

const getValueFromInput = ( childsInput ) => {
    let value_ = null
    if( childsInput[ 0 ].nodeName.toLocaleLowerCase() == 'input' ){
        const inpValue = childsInput[ 0 ]
        value_ = inpValue.value
        if( inpValue.value == 'null' && inpValue.className.indexOf('null') != -1 )
            value_ = null
        if( inpValue.value != 'null' && inpValue.className.indexOf('number_') != -1 )
            value_ = + inpValue.value 
    }
    else if( childsInput[ 1 ].nodeName.toLocaleLowerCase() == 'input' ){
        const inpValue = childsInput[ 1 ]
        value_ = inpValue.value
        if( inpValue.value == 'null' && inpValue.className.indexOf('null') != -1 )
            value_ = null
        if( inpValue.value != 'null' && inpValue.className.indexOf('number_') != -1 )
            value_ = + inpValue.value 
    }
    return value_
}

const transformValuesForm = ( nodes_ ) => {
    let jsonList = {}
    let labAux = {}, valAux = {}

    for( k in nodes_ ){
        let ch = nodes_[ k ]
        if( typeof( ch ) != 'function' ){ // recorre nodos
            if( ch.className ){
                console.log( '======================' );

                if( ch.className == 'mb-1 row' ){
                    //console.log( ch.nodeName ); //console.info( jsonList )
                    console.info( '--- Hijos:' )
                    let nameLabel_, value_ = null
                    let i = 0, childsForm = ch.childNodes
                    for( i=0; i < childsForm.length; i++ ){
                        if( childsForm[ i ].nodeName != '#text' ){ // recorre Hijos
                            let childForm = childsForm[ i ]
                            //console.log( childForm )
                            if( childForm.nodeName.toLocaleLowerCase() == 'label' )
                            {
                                nameLabel_ = clearLabel( childForm.innerHTML )
                            }
                            else{
                                const childsInput = childForm.childNodes
                                /*
                                if( childsInput[ 0 ].nodeName.toLocaleLowerCase() == 'input' ){
                                    const inpValue = childsInput[ 0 ]
                                    value_ = inpValue.value
                                    if( inpValue.value == 'null' && inpValue.className.indexOf('null') != -1 )
                                        value_ = null
                                    if( inpValue.value != 'null' && inpValue.className.indexOf('number_') != -1 )
                                        value_ = + inpValue.value 
                                }
                                else if( childsInput[ 1 ].nodeName.toLocaleLowerCase() == 'input' ){
                                    const inpValue = childsInput[ 1 ]
                                    value_ = inpValue.value
                                    if( inpValue.value == 'null' && inpValue.className.indexOf('null') != -1 )
                                        value_ = null
                                    if( inpValue.value != 'null' && inpValue.className.indexOf('number_') != -1 )
                                        value_ = + inpValue.value 
                                } */
                                value_ = getValueFromInput( childsInput )
                            }

                            if( value_ !== null )
                            console.log({ nameLabel_, value_ })
                        }
                    }

                    // Agrego la pareja:
                    let nv = Object.keys( labAux ).length
                    if( nv == 0 ){ console.info(' ... entra Normal..')
                        jsonList[ nameLabel_ ] = value_
                    }
                    else{ console.info(' ... entra SUBvector..')
                        valAux[ nv ][ nameLabel_ ] = value_
                        console.info( `Guardado: nv=${nv} nameLabel_="${nameLabel_}" 
                            value_=${value_}. valAux[ nv ]: `)
                        console.log( JSON.stringify( valAux[ nv ] ) )
                    }
                }
                if( ch.className == 'new-object' || ch.className == 'new-array' ){
                    const icon = ( ch.className == 'new-object' ) ? '{' : '['
                    console.warn( icon )
                    let nameLabel = clearLabel( ch.innerHTML )
                    // 
                    let nv = +( Object.keys( labAux ).length ) + 1
                    console.log('=== NUEVO nivel = ' + nv + ` . nameLabel="${nameLabel}"` );
                    labAux[ nv ] = nameLabel
                    //valAux[ nv ] = {}
                    valAux[ nv ] = ( icon == '{' ) ? {} : []
                }
                if( ch.className == 'object-end' || ch.className == 'array-end' ){
                    const icon = ( ch.className == 'object-end' ) ? '}' : ']'
                    console.warn( icon )
                    let nv = Object.keys( labAux ).length
                    const nv_x2 = + nv + 1
                    console.log('=== FIN Nivel = ' + nv )
                    console.log(`labAux[${nv}]: "` +labAux[ nv ]+ `" . valAux[${nv}]:`)
                    let strValAux = JSON.stringify( valAux[ nv ] ) // Este "Nuevo"
                    console.log( strValAux )

                    const nivel = ( valAux[ nv_x2 ] === undefined ) ? nv : nv_x2
                    //console.info( `Antes de Clonarlo ---> valObjAux:`, valAux[ nivel ] )
                    let valObjAux = Object.assign( {}, valAux[ nivel ] )
                    if( icon == ']' )
                        valObjAux = [ ...valAux[ nivel ] ]
                    console.info( `nivel = ${nivel}, Guardara valObjAux:` )
                    console.log( JSON.stringify( valObjAux ) )
                    if( nv == 1 ){
                        if( icon == '}' ){
                            let fusion = { ...valAux[ nv ], ...valObjAux }
                            jsonList[ labAux[ nv ] ] = Object.assign( {}, fusion )
                        }
                        else{
                            let fusion = [ ...valAux[ nv ], ...valObjAux ]
                            jsonList[ labAux[ nv ] ] = [ ...fusion ]
                        }
                        console.log( `save() NIVEL 1: `, JSON.stringify( jsonList ) )
                    }
                    else{
                        //console.log(`INFO:Para nv = ${nv}, valAux[${nv}] = `); console.log( JSON.stringify( valAux[ nv ] ) )
                        console.log(`valAux[nv][labAux[nv]] => `); console.log( JSON.stringify( valAux[nv][ labAux[nv] ] ) )
                        let fusion = { ...valAux[ nv ], ...valObjAux }
                        if( icon == ']' ){
                            console.log( '...fusionando arrays ')                            
                            fusion = [ ...valAux[ nv ], ...valObjAux ]
                        }
                        //valAux[ nv ] = {}
                        valAux[ nv ] = ( icon == ']' ) ? {} : []

                        if( nv == nivel ){
                            console.log(' nv == nivel ==> ' + nv )
                            valAux[ nv ][ labAux[ nv ] ] = Object.assign( {}, valObjAux )
                        }
                        else{                            
                            console.log( '==> Fusion: ', JSON.stringify( fusion ) )
                            //valAux[ nv ][ labAux[ nv ] ] = Object.assign( {}, fusion )
                            if( icon == '}' )
                                valAux[ nv ][ labAux[ nv ] ] = Object.assign( {}, fusion )
                            else
                                valAux[ nv ][ labAux[ nv ] ] = [ ...fusion ]
                        }                        
                        console.log(`valAux[${nv}] despuesSave() => `, JSON.stringify( valAux[ nv ] ) )
                    }

                    // Quito posicion final
                    delete labAux[ nv ]
                    console.info('.............. Menos un Nivel FIN-label: ', labAux )
                }
            }
        }
    }
    console.log( 'JSON FINAL ====> ', jsonList );
    return jsonList
}

createApp({
    data() {
        return {
            message: 'Pruebas',
            local: false,
            url_1: 'https://reportes.pagosimple.com.co',
            url_2: 'http://localhost:28053',
            url: 'https://reportes.pagosimple.com.co',
            urlBack: '/back-api-simple-dev/v1/local/api-simple',
            loginData: {
                tipo: 'CC',
                numero: '',
                contrasena: '',
                nit: '900097333',
                company: '79d16e08edbb2792c232542f9a6a27716b205a22e59775aee2b91f087dab5a8a93e70be94dec2f59e306906352687ed6c09a41c47342d6eb021a0ef8a2711624',
            },
            loginRes: {
                refresh_token: '',
                refresh_token_ttl: '',
                refresh_token_date: '',
                faces: '',
                faces_: false,
                token: '',
            },
            id: '',
            cc_aportante: '',
            token_nit: '',
            authRes: {
                app_id: '',
                contributor: '',
                profiles: '',
                refrescar: '',
            },
            //json_indep_str: '{\n\n}',
            json_indep_str: `{"nombre":"pepe","edad":40, 
                "dir":{"direccion":"cll 123", "barrio":"Alpes", "nombre":"valor nombre 2s"},
                "esNull": null,
                "srtNull": "null",
                "nivel1": {
                    "hola2": "mundo2",
                    "nivel2": {
                        "hola3": "mundo3",
                        "nivel3": {
                            "hola4": "mundo4",
                            "nivel4": {
                                "hola5": "mundo5"
                            }
                        }
                    }
                }
            }`,
            json_indep_base: null,
            json_indep: null,
        }
    },
    methods: {
        changeUrl(){
            const local = ! this.local
            const url = ( local ) ? this.url_1 : this.url_2
            this.url = url
        },
        async postLogin() {
            const dataPost = JSON.stringify({
                document_type: this.loginData.tipo,
                document: this.loginData.numero,
                password: this.loginData.contrasena,
                nit: this.loginData.nit,
                company: this.loginData.company,
            })
            console.log({ dataPost })
            //
            const resp = await fetch( this.url + this.urlBack + '/auth/login', {
                method: 'POST',
                body: dataPost,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const data = await resp.json();
            console.log({ data })

            if( ! data.success ){
                alert( data.message )
            }
            else{
                const vecResp = data.data.session_token.split('||')
                this.loginRes['refresh_token'] = vecResp[ 0 ]
                this.loginRes['refresh_token_ttl'] = vecResp[ 1 ]
                this.loginRes['refresh_token_date'] = vecResp[ 2 ]
                this.loginRes['faces'] = vecResp[ 3 ]
                this.loginRes['token'] = vecResp[ 4 ]
                
                this.token_nit = data.data.token
            }
        },
        async getAuth(){
            const params = `${this.id}/${this.loginData.tipo}/${this.cc_aportante}`
            console.log({ params, loginRes: this.loginRes })
            let headers = {
                'Content-Type': 'application/json',
                //'token': this.loginRes.token,
                //'refresh_token': this.loginRes.refresh_token,
                //'refresh_token_ttl': this.loginRes.refresh_token_ttl,
                //'refresh_token_date': this.loginRes.refresh_token_date,
                'nit': this.loginData.nit,
                'token': this.token_nit,
                'session_token': this.session_token,
            }
            /*
            if( this.loginRes.faces_ ) headers.faces_ = this.loginRes.faces
            else headers.faces = this.loginRes.faces */

            const resp = await fetch(
                this.url + this.urlBack + '/auth/' + params, 
            {
                method: 'GET',
                headers,
            })
            const data = await resp.json();
            console.log({ data })
            
            if( ! data.success ){
                alert( data.message )
            }
            else{
                const vecResp = data.data.auth_token.split('||')
                this.authRes['app_id'] = vecResp[ 0 ]
                this.authRes['contributor'] = vecResp[ 1 ]
                this.authRes['profiles'] = vecResp[ 2 ]
            }
        },
        strToObject(){
            //console.log( this.json_indep_str )
            const obj = JSON.parse( this.json_indep_str )
            console.log({ obj })
            this.json_indep_base = { ...obj }

            const divJsonIndep = document.querySelector('#div-json-indep')

            html = forEachObject( obj ) + ` `

            divJsonIndep.innerHTML = html
        },
        getValuesForm(){
            const childs = document.querySelector('#div-json-indep').childNodes
            this.json_indep = transformValuesForm( childs )
        }
    },
    computed: {
        session_token(){
            const loginRes = this.loginRes
            return `${loginRes.refresh_token}||${loginRes.refresh_token_ttl}||${loginRes.refresh_token_date}||${loginRes.faces}||${loginRes.token}`
        },
        auth_token(){
            const authRes = this.authRes
            return `${authRes.app_id}||${authRes.contributor}||${authRes.profiles}`
        }
    }
}).mount('#app')

