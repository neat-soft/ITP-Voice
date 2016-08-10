/**
 * Created by root on 12/05/16.
 */
var BrandProvisioners = require('mongoose').model('brandProvisioners');
var Q = require('q');
var fs = require("fs");
var _ = require("underscore");


var db = function () {
    var self = this;

    this.addBrandProvisioner = function (brand) {
        var deferred = Q.defer();
        var newBrandProvisioner = new BrandProvisioners(brand);
        newBrandProvisioner.save(function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getBrandProvisioner = function (brand, family, model) {
        var deferred = Q.defer();
        var query = {
            brand: brand,
            family: family,
            model: model
        };
        console.log("Query: ", query);
        BrandProvisioners.findOne(query, function (err, brands) {
            if (err) {
                deferred.reject(err);
            } else {
                if(brands === null)
                    deferred.reject({error: "Brand Provisioner not found"});
                else
                    deferred.resolve(brands);
            }
        });
        return deferred.promise;
    };
    this.getBrandProvisionerById = function (id) {
        var deferred = Q.defer();
        BrandProvisioners.findById(id, function (err, brand) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(brand);
            }
        });
        return deferred.promise;
    };
    this.getAllBrandProvisioner = function () {
        var deferred = Q.defer();
        BrandProvisioners.find({}, function (err, brands) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(brands);
            }
        });
        return deferred.promise;
    };
    /*Need Testing*/
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        BrandProvisioners.findByIdAndUpdate(id, body, function (err, brand) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(brand);
            }
        });
        return deferred.promise;

    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        BrandProvisioners.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting brandProvisioner !"});
            } else {
                deferred.resolve({success: "brandProvisioner deleted"});
            }
        });
        return deferred.promise;
    };

    /*
     Yealink brand
     */
    this.yealinkBrand = function (family, model, device) {
        var deferred = Q.defer();
        if(family.toLowerCase() === "t1x") {
            //TODO: t1x
            var configFile = __dirname + "/endpoints/yealink/" + family + "/\$mac.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if(err)
                    deferred.reject({error: "errot to get config file"});
                else {
                    var sip = device.sip_settings.sip;
                    //var realm = account.data.realm;
                    data = data.replace(/{\$displayname}/g, sip.username);
                    deferred.resolve(bProv);
                }
            });
        }else if(family.toLowerCase() === "t2x"){
            var configFile = __dirname + "/endpoints/yealink/" + family + "/\$mac.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    //todo: get info from device
                    //console.log(account);
                    var sip = device.sip_settings.sip;
                    //var realm = account.data.realm;
                    data = data.replace(/{\$displayname}/g, sip.username);
                    data = data.replace(/{\$username}/g, sip.username);
                    data = data.replace(/{\$secret}/g, sip.password);
                    //data = data.replace(/{\$server_host}/g, realm);
                    data = data.replace(/{\$server_port}/g, "5060");
                    data = data.replace(/{\$enable_outbound_proxy_server}/g, "1");
                    data = data.replace(/{\$outbound_host}/g, "104.131.127.136");
                    data = data.replace(/{\$outbound_port}/g, "5060");
                    data = data.replace(/{\$transport|0}/g, "0");
                    data = data.replace(/{\$server_expires}/g, "3600");
                    data = data.replace(/{\$voicemail_number}/g, "");
                    data = data.replace(/{\$missed_call_log|1}/g, "0");
                    deferred.resolve(data);
                }
            });
        }else if(family.toLowerCase() === "t2xv71") {
            var configFile = __dirname + "/endpoints/yealink/" + family + "/\$mac.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    //todo: get info from device
                    //console.log(account);
                    var sip = device.sip_settings.sip;
                    //var realm = account.data.realm;
                    data = data.replace(/{\$displayname}/g, sip.username);
                    data = data.replace(/{\$username}/g, sip.username);
                    data = data.replace(/{\$secret}/g, sip.password);
                    //data = data.replace(/{\$server_host}/g, realm);
                    data = data.replace(/{\$server_port}/g, "5060");
                    data = data.replace(/{\$enable_outbound_proxy_server}/g, "1");
                    data = data.replace(/{\$outbound_host}/g, "104.131.127.136");
                    data = data.replace(/{\$outbound_port}/g, "5060");
                    data = data.replace(/{\$transport|0}/g, "0");
                    data = data.replace(/{\$server_expires}/g, "3600");
                    data = data.replace(/{\$voicemail_number}/g, "");
                    data = data.replace(/{\$missed_call_log|1}/g, "0");
                    deferred.resolve(data);
                }
            });
        }else if(family.toLowerCase() === "t3x") {
            var configFile = __dirname + "/endpoints/yealink/" + family + "/\$mac.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err)
                    deferred.reject({error: "errot to get config file"});
                else {
                    var sip = device.sip_settings.sip;
                    //var realm = account.data.realm;
                    data = data.replace(/{\$displayname}/g, sip.username);
                    deferred.resolve(bProv);
                }
            });
        }else
            deferred.reject({error: "family not found"});
        return deferred.promise;
    };


    /*
     Cisco Brand
     */
    this.ciscoBrand = function (family, model, device) {
        var deferred = Q.defer();
        if(family.toLowerCase() === "ata18x"){
            var configFile = __dirname + "/endpoints/cisco/" + family + "/ata\$mac.txt";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    data = data.replace(new RegExp(/{\$server.ip.1}/g), '');
                    data = data.replace(new RegExp(/{\$image_id}/g), '');
                    data = data.replace(new RegExp(/{\$image_name}/g), '');
                    data = data.replace(new RegExp(/{\$username.line.1}/g), '');
                    data = data.replace(new RegExp(/{\$username.line.2}/g), '');
                    data = data.replace(new RegExp(/{\$secret.line.1}/g), '');
                    data = data.replace(new RegExp(/{\$secret.line.2}/g), '');
                    data = data.replace(new RegExp(/{\$atadialplan}/g), '');
                    deferred.resolve(data);
                }
            });
        }else if(family.toLowerCase() === "sip78xx"){
            /*var configFile = __dirname + "/endpoints/cisco/" + family + "/spa\$mac.txt";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    data = data.replace(new RegExp(/{\$server.ip.1}/g), '');
                    data = data.replace(new RegExp(/{\$image_id}/g), '');
                    data = data.replace(new RegExp(/{\$image_name}/g), '');
                    data = data.replace(new RegExp(/{\$username.line.1}/g), '');
                    data = data.replace(new RegExp(/{\$username.line.2}/g), '');
                    data = data.replace(new RegExp(/{\$secret.line.1}/g), '');
                    data = data.replace(new RegExp(/{\$secret.line.2}/g), '');
                    data = data.replace(new RegExp(/{\$atadialplan}/g), '');
                    deferred.resolve(data);
                }
            });*/
        }else if(family.toLowerCase() === "spa" || family.toLowerCase() === "spa5xx"){
            var configFile = __dirname + "/endpoints/cisco/" + family + "/spa\$mac.xml";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    //TODO: Loop
                    //spa@PSN.cfg
                    data = data.replace(new RegExp("{line_loop}", "g"), '');
                    data = data.replace(new RegExp("{/line_loop}", "g"), '');
                    data = data.replace(new RegExp(/{\$line}/g), '1');

                    data = data.replace(new RegExp(/{\$profile_resync}/g), '');
                    data = data.replace(new RegExp(/{\$provisioning_type}/g), '');
                    data = data.replace(new RegExp(/{\$server.ip.1}/g), '');
                    data = data.replace(new RegExp(/{\$share_call_appearance|private}/g), '');
                    data = data.replace(new RegExp(/{\$provisioning_path}/g), '');
                    data = data.replace(new RegExp(/{\$text_logo}/g), '');
                    data = data.replace(new RegExp(/{\$logo_type}/g), '');
                    data = data.replace(new RegExp(/{\$background_type}/g), '');
                    data = data.replace(new RegExp(/{\$picture_url}/g), '');
                    data = data.replace(new RegExp(/{\$station_name}/g), '');
                    data = data.replace(new RegExp(/{\$voicemail_extension}/g), '');
                    data = data.replace(new RegExp(/{\$displaynameline}/g), '');
                    data = data.replace(new RegExp(/{\$short_name}/g), '.');
                    data = data.replace(new RegExp(/{\$username}/g), '');
                    data = data.replace(new RegExp(/{\$secret}/g), '');
                    data = data.replace(new RegExp(/{\$blf_ext_type}/g), '');
                    data = data.replace(new RegExp(/{\$share_call_appearance}/g), '');
                    data = data.replace(new RegExp(/{\$extended_function}/g), '');
                    data = data.replace(new RegExp(/{\$dial_plan}/g), '.');
                    data = data.replace(new RegExp(/{\$server_expires|3600}/g), '.');
                    data = data.replace(new RegExp(/{\$answer_call_without_reg|No}/g), '');
                    data = data.replace(new RegExp(/{\$first_audio_codec}/g), '');
                    data = data.replace(new RegExp(/{\$second_audio_codec}/g), '');
                    data = data.replace(new RegExp(/{\$third_audio_codec}/g), '');
                    data = data.replace(new RegExp(/{\$server_host}/g), '.');
                    data = data.replace(new RegExp(/{\$use_outbound_p|No}/g), '');
                    data = data.replace(new RegExp(/{\$outbound_proxy_host}/g), '');
                    data = data.replace(new RegExp(/{\$proxy_fallback_intvl|3600}/g), '');
                    data = data.replace(new RegExp(/{\$proxy_redundancy_method|Normal}/g), '');
                    data = data.replace(new RegExp(/{\$use_dns_srv|No}/g), '');
                    data = data.replace(new RegExp(/{\$dns_srv_prefix|Yes}/g), '');
                    data = data.replace(new RegExp(/{\$nat_mapping_enabled|Yes}/g), '');
                    data = data.replace(new RegExp(/{\$nat_keep_alive_enabled|Yes}/g), '');
                    data = data.replace(new RegExp(/{\$enable_upgrade}/g), '');
                    data = data.replace(new RegExp(/{\$upgrade_path}/g), '');
                    data = data.replace(new RegExp(/{\$enable_webserver}/g), '');
                    data = data.replace(new RegExp(/{\$webserver_port}/g), '');
                    data = data.replace(new RegExp(/{\$enable_webserver_admin}/g), '');
                    data = data.replace(new RegExp(/{\$administrator_password}/g), '');
                    data = data.replace(new RegExp(/{\$user_password}/g), '');
                    data = data.replace(new RegExp(/{\$enable_cdp|No}/g), '');
                    data = data.replace(new RegExp(/{\$ntp}/g), '');
                    data = data.replace(new RegExp(/{\$timezone}/g), '');
                    data = data.replace(new RegExp(/{\$dateformat}/g), '');
                    data = data.replace(new RegExp(/{\$timeformat}/g), '');
                    data = data.replace(new RegExp(/{\$page_code}/g), '');
                    data = data.replace(new RegExp(/{\$syslog_server}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_2}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_3}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_4}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_5}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_6}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_7}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_8}/g), '');
                    data = data.replace(new RegExp(/{\$speed_dial_9}/g), '');
                    data = data.replace(new RegExp(/{\$ac_call_pickup}/g), '');
                    data = data.replace(new RegExp(/{\$loop_unit1}/g), '');
                    data = data.replace(new RegExp(/{\$loop_unit2}/g), '');
                    data = data.replace(new RegExp(/{\$ring1|n=Classic-1;w=3;c=1}/g), '');
                    data = data.replace(new RegExp(/{\$ring2|n=Classic-2;w=3;c=2}/g), '');
                    //spa500
                    data = data.replace(new RegExp(/{\$server_port}/g), '');

                    deferred.resolve(data);
                }
            });
        }else
            deferred.reject({error: "family not found"});
        return deferred.promise;
    };


    /*
     Cisco Brand
     */
    this.polycomBrand = function (family, model, device) {
        var deferred = Q.defer();
        if(family.toLowerCase() === "ptx151"){
            var result = [];
            //File 1: sip_$ext.cfg
            var configFile = __dirname + "/endpoints/polycom/" + family + "/sip_\$ext.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    result.push("File sip_\$ext.cfg: ");
                    data = data.replace(new RegExp(/{\$server.ip.1}/g), '');
                    data = data.replace(new RegExp(/{\$server.port.1}/g), '');
                    data = data.replace(new RegExp(/{\$ext}/g), '');
                    data = data.replace(new RegExp(/{\$secret}/g), '');
                    data = data.replace(new RegExp(/{\$displayname}/g), '');
                    //remove line loop
                    data = data.replace(new RegExp("{/line_loop}", "g"), '');
                    data = data.replace(new RegExp("{line_loop}", "g"), '');
                    data = data.replace(new RegExp(/{\$line}/g), '1');
                    result.push(data);
                    //deferred.resolve(data);
                }
            });
            //File 2: sip_$ext.cfg
            var configFile = __dirname + "/endpoints/polycom/" + family + "/sip_allusers.cfg";
            fs.readFile(configFile, 'utf8', function read(err, data) {
                if (err) {
                    deferred.reject({error: "error to get config file"});
                } else {
                    result.push("File sip_\$ext.cfg: ");
                    data = data.replace(new RegExp(/{\$server.ip.1}/g), '');
                    data = data.replace(new RegExp(/{\$server.port.1}/g), '');
                    result.push(data);
                    deferred.resolve(result);
                }
            });
        }else if(family.toLowerCase() === "spipm"){

        }else if(family.toLowerCase() === "splm"){

        }else if(family.toLowerCase() === "spom"){

        }else
            deferred.reject({error: "family not found"});
        return deferred.promise;
    };
};

module.exports = db;