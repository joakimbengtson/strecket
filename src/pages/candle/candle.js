import React from "react";
import Request from 'yow/request';
import {Popover, Button, Container, Table, Row, Col} from 'react-bootify';
import PropTypes from 'prop-types';

const math = require('mathjs');

const AVERAGECOUNT = 30;
const WINRATE = 2;

const S_LIMIT = 10;
const M_LIMIT = 30;
const L_LIMIT = 50;
const XL_LIMIT = 70;


var config = require('../config.js');


function getSweDate(a) {

    var time = a.substring(0, 10);
	
    return time;
}


export default class extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = {candles: [], error: ""};
    }
    
    fetchQuotes(symbol) {
        return new Promise((resolve, reject) => {
		    console.log("Hämtar tick för", symbol);

            var request = new Request("http://" + config.IP);
			var query = {};
            
			query.sql = 'select * from stockquotes where symbol=? order by date';
			query.values = [symbol];

            request
                .get('/mysql', {query:query})
                .then(response => {
					console.log("fetchQuotes: response");
	                
                    resolve(response.body);
                })
                .catch(error => {
	                console.log("FEL: fetch:", error);
                    reject(error);
                });
        });
    }    

    collectTickers() {
        return new Promise((resolve, reject) => {
	    
		    var self = this;
		    var request = new Request("http://" + config.IP);
			var query = {};
		
		    console.log("Hämtar tickers...");
		    
			query.sql = 'select symbol from stocks';
		
		    request
		        .get('/mysql', {query:query})
		        .then(response => {
			        resolve(response.body);
		        })
		        .catch(error => {
		            console.log("FEL: collectCandles:", error);
		            reject(error);
		        });
		});

    }
    
    
    componentDidMount() {
		this.getCandles();
	}
    
    
    onCancel() {
        window.history.back();
    }    
    
    
    measureVol(sigma) {
		if (sigma < -0.5)
			return "S";
		else if (sigma < 0.5)
			return "M";
		else if (sigma < 1)
			return "L";
		else if (sigma < 2)
			return "XL";
		else
			return "XXL";
    }
    
    
    measure(part, total) {
	    var perc = Math.trunc((part/total) * 100);
	    
		if (perc < S_LIMIT)
			return "S-";
		else if (perc < M_LIMIT)
			return "M-";
		else if (perc < L_LIMIT)
			return "L-";
		else if (perc < XL_LIMIT)
			return "XL-";
		else
			return "XXL-";	    
    }
    
/*-----------
    getCandles() {
        var self = this;

		self.collectTickers().then(symbols => {
			console.log("Hämtat alla tickers", symbols.length);
			
	        var loop = (index) => {
	            if (index < 10) {
		            
	                self.fetchQuotes(symbols[index].symbol).then(ticks => {
		              	var sumVol = 0;
		              	var averageVol;
		              	var stdVol;
		              	var vol = [];

		              	if (ticks.length > AVERAGECOUNT) {
			              	
			              	// Beräkna medelvärde och std på volym
							for (var i = 0; i < AVERAGECOUNT; i++) {
								sumVol = sumVol + ticks[i].volume;
								vol.push(ticks[i].volume);
							}
			              	
			              	averageVol = sumVol / AVERAGECOUNT;
			              	stdVol = Math.trunc(math.std(vol));
			              	
			              	
			              	// Klipp bort sekvensen som användes för medelvärde och std
							ticks.splice(0, AVERAGECOUNT);
							
							
							// Gå igenom kvarvarande ticks och leta candles
							for (var i = 0; i < ticks.length-1; i++) {
															
								// Next day greater than WINRATE?	
								if (((ticks[i+1].high/ticks[i].close)-1)*100 > WINRATE) {
									
									console.log("Hittat vinnande candle", getSweDate(ticks[i].date), ticks[i+1].high, ticks[i].close, ((ticks[i+1].high/ticks[i].close)-1)*100);
									
									var antenna = (ticks[i].close > ticks[i].open) ? ticks[i].high - ticks[i].close : ticks[i].high - ticks[i].open;
									var tail    = (ticks[i].close > ticks[i].open) ? ticks[i].open - ticks[i].low   : ticks[i].close-ticks[i].low;
									var body    = math.abs(ticks[i].open - ticks[i].close);
									
									var volumeSigma = (ticks[i].volume-averageVol)/stdVol;
																		
									var candleHeight = antenna + tail + body;
									
									var sizeStr = self.measure(antenna, candleHeight) + self.measure(tail, candleHeight) + self.measure(body, candleHeight) + self.measureVol(volumeSigma);
									
									var tickDate = new Date(ticks[i].date);
									
									const j = this.state.candles.findIndex(o => o.str === sizeStr);
									
									if (j > -1) {
										console.log(" Finns redan, ökar antal");
										
									    let items = this.state.candles;
									    let item = items[j];
									    item.count = item.count + 1;
									    items[j] = item;
									    this.setState({items});										
										
									}
									else {
										var o = {};
										
										o.str = sizeStr;
										o.count = 1;
										
										this.setState({candles: this.state.candles.concat(o)});										
										console.log(" Finns inte, lägger till");										
									}
									
								}
								
							}
						}
						else
							console.log("Färre än ", AVERAGECOUNT, " poster för ", symbols[index].symbol);

	                    loop(index + 1);
	                })
	                .catch((error) => {
	                    console.log("FEL: från fetchQuotes:", error);
	                });
	            }
	            else {
	                console.log("Klar ---------");
	            }    
	        }
	        
            loop(0);            
	        
        })
        .catch((error) => {
            console.log("FEL: från collectTickers:", error);
        });
    
    }
-------- */    
    
        
    getCandles() {
        var self = this;

		self.collectTickers().then(symbols => {
			console.log("Hämtat alla tickers", symbols.length);
			
	        var loop = (index) => {
	            if (index < 400) {
		            
	                self.fetchQuotes(symbols[index].symbol).then(ticks => {
		              	var sumVol = 0;
		              	var averageVol;
		              	var stdVol;
		              	var vol = [];

		              	if (ticks.length > AVERAGECOUNT) {
			              	
			              	// Beräkna medelvärde och std på volym
							for (var i = 0; i < AVERAGECOUNT; i++) {
								sumVol = sumVol + ticks[i].volume;
								vol.push(ticks[i].volume);
							}
			              	
			              	averageVol = sumVol / AVERAGECOUNT;
			              	stdVol = Math.trunc(math.std(vol));
			              	
			              	
			              	// Klipp bort sekvensen som användes för medelvärde och std
							ticks.splice(0, AVERAGECOUNT);
							
							
							// Gå igenom kvarvarande ticks och leta candles
							for (var i = 0; i < ticks.length-1; i++) {

								var pl = ((ticks[i+1].high/ticks[i].close)-1)*100
																								
								// console.log("Hittat vinnande candle", getSweDate(ticks[i].date), ticks[i+1].high, ticks[i].close, ((ticks[i+1].high/ticks[i].close)-1)*100);
								
								var antenna = (ticks[i].close > ticks[i].open) ? ticks[i].high - ticks[i].close : ticks[i].high - ticks[i].open;
								var tail    = (ticks[i].close > ticks[i].open) ? ticks[i].open - ticks[i].low   : ticks[i].close-ticks[i].low;
								var body    = math.abs(ticks[i].open - ticks[i].close);
								
								var volumeSigma = (ticks[i].volume-averageVol)/stdVol;
																	
								var candleHeight = antenna + tail + body;
								
								var sizeStr = self.measure(antenna, candleHeight) + self.measure(tail, candleHeight) + self.measure(body, candleHeight) + self.measureVol(volumeSigma);
								
								var tickDate = new Date(ticks[i].date);
								
								const j = this.state.candles.findIndex(o => o.str === sizeStr);
								
								if (j > -1) {
									console.log(" Finns redan, ökar antalen");
									
								    let items = this.state.candles;
								    let item = items[j];
								    
								    if (pl > WINRATE)
									    item.bigWinCount = item.bigWinCount + 1;
									else if (pl > 0)
									    item.winCount = item.winCount + 1;
									else
										item.lossCount = item.lossCount + 1;

								    items[j] = item;
								    this.setState({items});										
									
								}
								else {
									console.log(" Finns inte, lägger till");										
																		
									var o = {};
									
									o.str = sizeStr;
									o.bigWinCount = 0;
									o.winCount = 0;									
									o.lossCount = 0;
									
								    if (pl > WINRATE)
									    o.bigWinCount = o.bigWinCount + 1;
									else if (pl > 0)
									    o.winCount = o.winCount + 1;
									else
										o.lossCount = o.lossCount + 1;									
									
									this.setState({candles: this.state.candles.concat(o)});										
								}
																	
							}
						}
						else
							console.log("Färre än ", AVERAGECOUNT, " poster för ", symbols[index].symbol);

	                    loop(index + 1);
	                })
	                .catch((error) => {
	                    console.log("FEL: från fetchQuotes:", error);
	                });
	            }
	            else {
	                console.log("Klar ---------");
	            }    
	        }
	        
            loop(0);            
	        
        })
        .catch((error) => {
            console.log("FEL: från collectTickers:", error);
        });
    
    }
    
    
    render() {

		const listCandles = this.state.candles.map((candleObj) =>
				<tr key={candleObj.str}>
					<td>{candleObj.str}</td>
					<td>{candleObj.bigWinCount}</td>
					<td>{candleObj.winCount}</td>					
					<td>{candleObj.lossCount}</td>
					<td>{Math.trunc(((candleObj.bigWinCount+candleObj.winCount)/(candleObj.bigWinCount+candleObj.winCount+candleObj.lossCount))*100) + "%"}</td>					
				</tr>
		);
	    
        return (
            <div id="candle">
                <Container fluid={true}>
                
                    <Container.Row>
                        <Container.Col>
						<Table bordered={true} responsive={true}> 
							<tr key='qwerty'><td>Antenna-Tail-Body-Volume</td><td>Big wins</td><td>Wins</td><td>Losses</td><td>Ratio</td></tr>
                        	{listCandles}
						</Table>
                        </Container.Col>
                    </Container.Row>
                    
                    <Container.Row>
                        <Button margin={{left:1, right:1}} color="success" size="lg" onClick={this.onCancel.bind(this)}>
                            Stäng
                        </Button>
                    </Container.Row>

                </Container>
            </div>
        );
    }
};

