// services/companyService.js  
const axios = require('axios');  
const cheerio = require('cheerio');  
const { Company } = require('../models');  
const { Op } = require('sequelize');  

class CompanyService {  
    static async refreshSP500List() {  
        try {  
            // Fetch data from Wikipedia  
            const response = await axios.get('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies');  
            const $ = cheerio.load(response.data);  
            const companies = [];  

            // Parse the first table on the page  
            $('#constituents tbody tr').each((i, element) => {  
                const tds = $(element).find('td');  
                if (tds.length > 0) {  
                    companies.push({  
                        ticker: $(tds[0]).text().trim(),  
                        name: $(tds[1]).text().trim(),  
                        sector: $(tds[3]).text().trim(),  
                        industry: $(tds[4]).text().trim(),  
                        active: true  
                    });  
                }  
            });  

            // Get existing companies  
            const existingCompanies = await Company.findAll({  
                attributes: ['ticker']  
            });  
            const existingTickers = new Set(existingCompanies.map(c => c.ticker));  

            // Identify companies to add, update, and deactivate  
            const companiesToAdd = [];  
            const companiesToUpdate = [];  
            const currentTickers = new Set();  

            companies.forEach(company => {  
                currentTickers.add(company.ticker);  

                if (!existingTickers.has(company.ticker)) {  
                    companiesToAdd.push(company);  
                } else {  
                    companiesToUpdate.push(company);  
                }  
            });  

            // Companies to deactivate (no longer in S&P 500)  
            const tickersToDeactivate = [...existingTickers].filter(  
                ticker => !currentTickers.has(ticker)  
            );  

            // Perform database operations in a transaction  
            await Company.sequelize.transaction(async (t) => {  
                // Add new companies  
                if (companiesToAdd.length > 0) {  
                    await Company.bulkCreate(companiesToAdd, {  
                        transaction: t  
                    });  
                }  

                // Update existing companies  
                for (const company of companiesToUpdate) {  
                    await Company.update(company, {  
                        where: { ticker: company.ticker },  
                        transaction: t  
                    });  
                }  

                // Deactivate companies no longer in S&P 500  
                if (tickersToDeactivate.length > 0) {  
                    await Company.update(  
                        { active: false },  
                        {  
                            where: {  
                                ticker: {  
                                    [Op.in]: tickersToDeactivate  
                                }  
                            },  
                            transaction: t  
                        }  
                    );  
                }  
            });  

            return {  
                added: companiesToAdd.length,  
                updated: companiesToUpdate.length,  
                deactivated: tickersToDeactivate.length  
            };  

        } catch (error) {  
            console.error('Error refreshing S&P 500 list:', error);  
            throw error;  
        }  
    }  

    static async getActiveCompanies() {  
        try {  
            return await Company.findAll({  
                where: { active: true },  
                order: [['ticker', 'ASC']]  
            });  
        } catch (error) {  
            console.error('Error fetching active companies:', error);  
            throw error;  
        }  
    }  
}  

module.exports = CompanyService;  