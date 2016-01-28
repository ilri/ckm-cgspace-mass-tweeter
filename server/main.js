Meteor.startup(function(){
    // Top-Level Communities of CGSPace
    var communities = [
        {
            name: "Africa RISING",
            hashTag: "#africarising"
        },
        {
            name: "AgriFood Chain Toolkit",
            hashTag: "#agrifood"
        },
        {
            name: "Animal Genetic Resources Virtual Library",
            hashTag: "#AGRVL"
        },
        {
            name: "Bioversity International",
            hashTag: "#Bioversity"
        },
        {
            name: "Center for International Forestry Research (CIFOR)",
            hashTag: "#CIFOR"
        },
        {
            name: "CGIAR Challenge Program on Water and Food (CPWF)",
            hashTag: "#CPWF"
        },
        {
            name: "CGIAR Collective Action in Eastern and Southern Africa",
            hashTag: "#CAESA"
        },
        {
            name: "CGIAR Gender and Agriculture Research Network",
            hashTag: "#GARN"
        },
        {
            name: "CGIAR Global Mountain Program",
            hashTag: "#GMP"
        },
        {
            name: "CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS)",
            hashTag: "#CCAFS"
        },
        {
            name: "CGIAR Research Program on Dryland Systems",
            hashTag: "#drylandsystems"
        },
        {
            name: "CGIAR Research Program on Livestock and Fish",
            hashTag: "#livestockandfish"
        },
        {
            name: "CGIAR Research Program on Water, Land and Ecosystems (WLE)",
            hashTag: "#WLE"
        },
        {
            name: "CGIAR System-wide Livestock Programme",
            hashTag: "#livestock"
        },
        {
            name: "East Africa Dairy Development Project",
            hashTag: "#eastafricadairy"
        },
        {
            name: "Feed the Future Innovation Lab for Small-Scale Irrigation",
            hashTag: "#feedthefuture"
        },
        {
            name: "Humidtropics, a CGIAR Research Program",
            hashTag: "#humidtropics"
        },
        {
            name: "IGAD Livestock Policy Initiative",
            hashTag: "#IGAD"
        },
        {
            name: "International Center for Agricultural Research in the Dry Areas (ICARDA)",
            hashTag: "#ICARDA"
        },
        {
            name: "International Center for Tropical Agriculture (CIAT)",
            hashTag: "#CIAT"
        },
        {
            name: "International Institute of Tropical Agriculture (IITA)",
            hashTag: "#CIAT"
        },
        {
            name: "International Livestock Research Institute (ILRI)",
            hashTag: "#ILRI"
        },
        {
            name: "International Potato Center (CIP)",
            hashTag: "#CIP"
        },
        {
            name: "International Water Management Institute (IWMI)",
            hashTag: "#IWMI"
        },
        {
            name: "Livestock and Irrigation Value Chains for Ethiopian Smallholders (LIVES)",
            hashTag: "#LIVES"
        },
        {
            name: "Technical Centre for Agricultural and Rural Cooperation (CTA)",
            hashTag: "#CTA"
        },
        {
            name: "Technical Consortium for Building Resilience to Drought in the Horn of Africa",
            hashTag: "#CTBRD"
        }
    ];

    // Add to database if not already available
    _.each(communities, function(community){
       if(Communities.find({name: community.name}).count() == 0){
           Communities.insert(community);
       }
    });

});