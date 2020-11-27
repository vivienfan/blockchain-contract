/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyAssetContract extends Contract {

    async myAssetExists(ctx, myAssetId) {
        const buffer = await ctx.stub.getState(myAssetId);
        return (!!buffer && buffer.length > 0);
    }

    async createMyAsset(ctx, myAssetId, value) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
        const eventPayload = Buffer.from(`Created asset ${myAssetId}(${value})`);
        ctx.stub.setEvent('myEvent', eventPayload);
    }

    async readMyAsset(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateMyAsset(ctx, myAssetId, newValue) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
        const eventPayload = Buffer.from(`Created asset ${myAssetId}(${newValue})`);
        ctx.stub.setEvent('myEvent', eventPayload);
    }

    async deleteMyAsset(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        await ctx.stub.deleteState(myAssetId);
    }

    async queryAllAssets(ctx) {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                const Key = res.value.key;
                let Record;
                try {
                    Record = res.value.value.toString('utf8');
                    allResults.push({ Key, Record });
                } catch(err) {
                    console.log(err);
                }
                if (res.done) {
                    console.log('end of data');
                    await iterator.close();
                    console.info(allResults);
                    return JSON.stringify(allResults);
                }
            }
        }
    }

}

module.exports = MyAssetContract;
