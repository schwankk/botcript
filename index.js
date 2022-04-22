const axios  = require("axios");
const api    = require("imersao-bot-cripto-api"); 
const symbol = "BTCBUSD";

const { Telegraf } = require('telegraf');
const bot = new Telegraf("5269108603:AAHVkWBWkp63DYq8BOrDaeff8VvLRI8QpRs"); //BotTelegram

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
let vmaxima = 0;
let vminima = 0;
let vvelamaxima = 0;
let vvelaminima = 0;
let iniciar  = false;
let fbitcoin = false;

const credentials = {
    apiKey: "iXOwLZ5pznEpAXgSJnqrLJUpTbobhexFtEPImonpUrYYJEKOeKo1U0hwxU7PtAEk",
    apiSecret: "UYCjIfwIIYSMEdmSxi59h3kH47B5NkrFTUosTJwUuyGYIJ9YkWFiwWLAQk2R1hh2",
    test: true
}

function calculaRSI(vfechamentos, vqtd){
    let vganhos = 0;
    let vperdas = 0;

    for(i=vfechamentos.length -vqtd; i < vfechamentos.length; i++){
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
    vminima = 0;
    vmaxima = 0;
    vvelaminima = 0;
    vvelamaxima = 0;
    
    for(i=0; i < vfechamentos.length; i++){
        if(vminima == 0){
            vminima = vfechamentos[i];
            vvelaminima = i;
        }
        else if(vminima > vfechamentos[i]){
            vminima = vfechamentos[i];
            vvelaminima = i;
        }

        if(vfechamentos[i]>vmaxima){
            vmaxima = vfechamentos[i]
            vvelamaxima = i;
        }       
    }

    return 0;
}

async function consulta(){  
    if(iniciar){
        const response      = await axios.get(`http://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m`);
        const vfechamentos  = response.data.map(vela => parseFloat(vela[4])); //Valor de fechamento da vela

        const vrsi = calculaRSI(vfechamentos,14);

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
            vcontadoralta++;        
            if(comprou & (vfechamentos[499] > vcompra) & (vcontadoralta >= 3)){
                vvendas   = vvendas + 1; //incrementa quantidade de vendas
                vvenda    = vfechamentos[499]; //armazena valor da ultima venda            
                comprou   = false; //marca que pode comprar novamente
                let qtd   = vcarteira;
                //const rvenda = await api.sell(credentials,symbol,qtd.toPrecision(3));
                //console.log(rvenda);
                vcarteira =  vcarteira - qtd;
                saldo = saldo + (qtd * vvenda); 
                
                bot.telegram.sendMessage("1682120570","Trade de Venda: " + vqtd + " BTC no valor U$" + vvenda);
            }    
                    
            vindicacao = "Indicação: Transação de Venda";
        }
        else if(vrsi < 20) { //COMPRANDO
            vcontadoralta = 0;
            vcontadorbaixa++;        
            if(!comprou & vcontadorbaixa >= 3){
                vcompras  = vcompras + 1; //incrementa quantidade de compras
                vcompra   = vfechamentos[499]; //armazena valor da ultima compra
                comprou   = true; //marca que comprou   
                vqtdcompra = vtransacao/vcompra; 
                //const rcompra = await api.buy(credentials,symbol,vqtdcompra.toPrecision(3));
                //console.log(rcompra);
                vcarteira += saldo/vcompra;
                saldo     = saldo - vtransacao;  
                
                bot.telegram.sendMessage("1682120570","Trade de Compra: " + vqtdcompra + " BTC no valor U$" + vcompra);
            }    

            vindicacao = "Indicação: Transação de Compra"        
        }
        else{
            vindicacao = "Indicação: Aguardar ";  
            vcontadoralta  = 0;
            vcontadorbaixa = 0;              
        }

        console.clear();
        console.log("");
        console.log(" Operadora: BINANCE - Bot Desenvolvido por: André R. Schwanke");
        console.log(" ..............................................................");
        console.log("");
        console.log(" Analisando Criptomoeda: " + symbol );        
        console.log("");
        console.log(" Fechamento atual:.... U$" + vfechamentos[499] + "  (" + vvariacao + ") ");
        console.log(" RSI atual:........... " + vrsi);
        console.log("");
        console.log(" Fechamento máximo 500 candles:......... " + vmaxima + " Na vela: " + vvelamaxima);
        console.log(" Fechamento mínimo 500 candles:......... " + vminima + " Na vela: " + vvelaminima);
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
            console.log(" Se Mantendo em Alta: " + vcontadoralta);    
        }
        else if(vcontadorbaixa > 0){
            console.log(" Se Mantendo em Baixa: " + vcontadorbaixa);    
        }
        console.log(" ..............................................................")     
        console.log("");
        console.log(" --------------------------------------------------------------");
        console.log("");
        console.log(" Saldo BOT:............... U$" + saldo);
        console.log(" Carteira atual:.......... " + vcarteira + " BTC");
        console.log(" Ultima Compra:........... " + vcompra);
        console.log(" Ultima Venda:............ " + vvenda);
        console.log(" Total de compras:........ " + vcompras);
        console.log(" Total de vendas:......... " + vvendas);
        console.log("");
        console.log(" --------------------------------------------------------------");

        var vdata = new Date();
        console.log( " Atualizado em: " + vdata);
    }           
}
       
    function botTelegram(){
        bot.hears('Oi', (ctx) => {
            ctx.reply('\nVocê iniciou uma conversa com o Bot de Criptomoedas do André.'
            +'\n\nOlá meu mestre! '        
            +'\n\nOpções Disponíveis:'
            +'\n1 - Iniciar Bot de Monitoramento/Trade Bitcoin'        
            +'\n2 - Iniciar Bot de Monitoramento/Trade Ethereum'        
            +'\n3 - Fechamento Atual Bitcoin'        
            +'\n4 - Fechamento Atual Ethereum');         
        });
        bot.hears('1', (ctx) => {
            iniciar = true;
            ctx.reply('Bot inicializado! ');
            ctx.reply('Você será avisado aqui quando houver Trades de compras ou vendas de acordo com sua estratégia definida no Bot. ');             
        });
        bot.hears('3', (ctx) => {
            a = 0;

            ctx.reply('1 Bitcoin U$ ' + a);            
            
        });
        bot.hears('Parar', (ctx) => {
            iniciar = false;
            console.clear();
            ctx.reply('Bot finalizado! ');            
        });
        //bot.telegram.sendMessage("1682120570","Teste");
        bot.launch();
    }

    async function fechamentoBitcoin(){
        
        //try{
        //    console.log("aqui2");
        //    const response = axios.get(`http://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m`);
        //    const v1  = response.data.map(vela => parseFloat(vela[4])); //Valor de fechamento da vela               
        //    v2 = v1;
        //    return v2;
        //}        
        //catch(e){
        //    console.log("aqui3");
        //    v2 = 000000;                
        //    return v2;
        //}        
    }

    botTelegram();
    setInterval(consulta, 30000);