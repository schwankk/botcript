const axios  = require("axios");
const api    = require("imersao-bot-cripto-api"); 
const symbol = "ETHUSDT";

let comprou    = false;
let vtransacao = 100;
let saldo      = 100;
let vqtdcompra = 0;
let vcarteira  = 0;
let vcompras   = 0;
let vvendas    = 0;
let vcompra    = 0;
let vvenda     = 0;
let vanterior  = 0;
let vvariacao  = "";
let vindicacao = "";
let vcontadorbaixa  = 0;
let vcontadoralta   = 0;
let vrsi_anterior = 0;
let vmaxima = 0;
let vminima = 0;

const credentials = {
    apiKey: "iXOwLZ5pznEpAXgSJnqrLJUpTbobhexFtEPImonpUrYYJEKOeKo1U0hwxU7PtAEk",
    apiSecret: "UYCjIfwIIYSMEdmSxi59h3kH47B5NkrFTUosTJwUuyGYIJ9YkWFiwWLAQk2R1hh2",
    test: true
}

function calculaRSI(vfechamentos){
    let vganhos = 0;
    let vperdas = 0;

    for(i=vfechamentos.length -14; i < vfechamentos.length; i++){
        const vdiferenca = vfechamentos[i] - vfechamentos[i -1];
        if(vdiferenca >= 0){
            vganhos += vdiferenca;
        }
        else {
            vperdas -= vdiferenca;
        }
    }

    const vpoder = vganhos / vperdas;
    return 100 - (100 / (1 + vpoder));
}

function pegaMaximaMinimas(vfechamentos){
    for(i=0; i < vfechamentos.length; i++){
        if(vminima == 0){
            vminima = vfechamentos[i];
        }
        else if(vminima > vfechamentos[i]){
            vminima = vfechamentos[i];
        }

        if(vfechamentos[i]>vmaxima){
            vmaxima = vfechamentos[i]
        }       
    }

    return 0;
}

async function consulta(){
    
    const response      = await axios.get(`http://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m`);
    const vfechamentos  = response.data.map(vela => parseFloat(vela[4])); //Valor de fechamento da vela

    const vrsi = calculaRSI(vfechamentos);

    const maxim = pegaMaximaMinimas(vfechamentos);

    if(vanterior > vfechamentos[499]){
        vvariacao = " - ";
        vanterior = vfechamentos[499];
    }
    else if(vanterior < vfechamentos[499]){
        vvariacao = " + "
        vanterior = vfechamentos[499];
    }
    else{
        vvariacao = " = " 
    }
    
    
    if(vrsi > 75){ //VENDENDO
        vcontadorbaixa = 0;
        vcontadoralta = vcontadoralta + 1;
        if(comprou & (vfechamentos[499] > vcompra) & (vcontadoralta >= 3)){
            vvendas   = vvendas + 1; //incrementa quantidade de vendas
            vvenda    = vfechamentos[499]; //armazena valor da ultima venda            
            comprou   = false; //marca que pode comprar novamente
            let qtd   = vcarteira;
            //const rvenda = await api.sell(credentials,symbol,qtd.toPrecision(3));
            //console.log(rvenda);
            vcarteira =  vcarteira - qtd;
            saldo = saldo + (qtd * vvenda);                       
        }    
                
        vindicacao = "Indicação: Transação de Venda";
    }
    else if(vrsi < 30) { //COMPRANDO
        vcontadoralta = 0;
        vcontadorbaixa = vcontadorbaixa +1 ;        
        if(!comprou &(vcontadorbaixa >= 3)){
            vcompras  = vcompras + 1; //incrementa quantidade de compras
            vcompra   = vfechamentos[499]; //armazena valor da ultima compra
            comprou   = true; //marca que comprou   
            vqtdcompra = vtransacao/vcompra; 
            //const rcompra = await api.buy(credentials,symbol,vqtdcompra.toPrecision(3));
            //console.log(rcompra);
            vcarteira += saldo/vcompra;
            saldo     = saldo - vtransacao;            
        }    

        vindicacao = "Indicação: Transação de Compra"        
    }
    else{
        vindicacao = "Indicação: Aguardar ";  
        vcontadoralta  = 0;
        vcontadorbaixa = 0;              
    }

    console.clear();
    console.log(" Operadora: BINANCE - Bot Desenvolvido por: André R. Schwanke");
    console.log(" --------------------------------------------------------------");
    console.log("");
    console.log(" Analisando Criptomoeda: " + symbol );        
    console.log("");
    console.log(" Fechamento atual:.... U$" + vfechamentos[499] + "  (" + vvariacao + ") ");
    console.log(" RSI atual:........... " + vrsi);
    console.log("");
    console.log(" Fechamento máximo 500 candles:......... " + vmaxima);
    console.log(" Fechamento mínimo 500 candles:......... " + vminima);
    console.log(" ..............................................................")
    console.log("");
    if(comprou == true){
        console.log(" Monitorando para: Vender");    
    }
    else{
        console.log(" Monitorando para: Comprar");    
    }
    console.log(" ..............................................................")
    console.log(" " + vindicacao);   
    if(vcontadoralta > 0){
        console.log(" Se mantendo em Alta: " + vcontadoralta);    
    }
    else if(vcontadorbaixa > 0){
        console.log(" Se mantendo em Baixa: " + vcontadorbaixa);    
    }
    console.log(" ..............................................................")     
    console.log("");
    console.log(" --------------------------------------------------------------");
    console.log("");
    console.log(" Saldo BOT:............... U$" + saldo);
    console.log(" Carteira atual:.......... " + vcarteira + " ETH");
    console.log(" Ultima Compra:........... " + vcompra);
    console.log(" Ultima Venda:............ " + vvenda);
    console.log(" Total de compras:........ " + vcompras);
    console.log(" Total de vendas:......... " + vvendas);
    console.log("");
    console.log(" --------------------------------------------------------------");

    var vdata = new Date();
    console.log(" Atualizado em: " + vdata);
}

setInterval(consulta, 30000);