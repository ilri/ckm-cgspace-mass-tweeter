Meteor.startup(function(){
    // Top-Level Communities of CGSPace
    var communities = [
        {
            name: "Africa RISING",
            hashTag: "africarising"
        },
        {
            name: "AgriFood Chain Toolkit",
            hashTag: "agrifood"
        },
        {
            name: "Animal Genetic Resources Virtual Library",
            hashTag: "agrvl"
        },
        {
            name: "Bioversity International",
            hashTag: "bioversity"
        },
        {
            name: "Center for International Forestry Research (CIFOR)",
            hashTag: "cifor"
        },
        {
            name: "CGIAR Challenge Program on Water and Food (CPWF)",
            hashTag: "cpwf"
        },
        {
            name: "CGIAR Collective Action in Eastern and Southern Africa",
            hashTag: "caesa"
        },
        {
            name: "CGIAR Gender and Agriculture Research Network",
            hashTag: "garn"
        },
        {
            name: "CGIAR Global Mountain Program",
            hashTag: "gmp"
        },
        {
            name: "CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS)",
            hashTag: "ccafs"
        },
        {
            name: "CGIAR Research Program on Dryland Systems",
            hashTag: "drylandsystems"
        },
        {
            name: "CGIAR Research Program on Livestock and Fish",
            hashTag: "crp37"
        },
        {
            name: "CGIAR Research Program on Water, Land and Ecosystems (WLE)",
            hashTag: "wle"
        },
        {
            name: "CGIAR System-wide Livestock Programme",
            hashTag: "slp"
        },
        {
            name: "Center for International Forestry Research (CIFOR)",
            hashTag: "cifor"
        },
        {
            name: "East Africa Dairy Development Project",
            hashTag: "eadd"
        },
        {
            name: "Feed the Future Innovation Lab for Small-Scale Irrigation",
            hashTag: "ilssi"
        },
        {
            name: "Humidtropics, a CGIAR Research Program",
            hashTag: "humidtropics"
        },
        {
            name: "IGAD Livestock Policy Initiative",
            hashTag: "igad"
        },
        {
            name: "International Center for Agricultural Research in the Dry Areas (ICARDA)",
            hashTag: "icarda"
        },
        {
            name: "International Center for Tropical Agriculture (CIAT)",
            hashTag: "ciat"
        },
        {
            name: "International Institute of Tropical Agriculture (IITA)",
            hashTag: "iita"
        },
        {
            name: "International Livestock Research Institute (ILRI)",
            hashTag: "ilri"
        },
        {
            name: "International Potato Center (CIP)",
            hashTag: "cip"
        },
        {
            name: "International Water Management Institute (IWMI)",
            hashTag: "iwmi"
        },
        {
            name: "Livestock and Irrigation Value Chains for Ethiopian Smallholders (LIVES)",
            hashTag: "lives"
        },
        {
            name: "Technical Centre for Agricultural and Rural Cooperation (CTA)",
            hashTag: "cta"
        },
        {
            name: "Technical Consortium for Building Resilience to Drought in the Horn of Africa",
            hashTag: "ctbrd"
        }
    ];

    // Add to database if not already available
    _.each(communities, function(community){
       if(Communities.find({name: community.name}).count() == 0){
           Communities.insert(community);
       }
    });

});
