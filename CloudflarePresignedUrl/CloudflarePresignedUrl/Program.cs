using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Util;
using Amazon;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var r2AccessKey = builder.Configuration["R2:AccessKey"];
var r2SecretKey = builder.Configuration["R2:SecretKey"];
var r2Endpoint = builder.Configuration["R2:Endpoint"];
var r2Bucket = builder.Configuration["R2:BucketName"];

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = new AmazonS3Config
    {
        RegionEndpoint = RegionEndpoint.USEast1, 
        ServiceURL = r2Endpoint,
        ForcePathStyle = true 
    };

    return new AmazonS3Client(r2AccessKey, r2SecretKey, config);
});

var app = builder.Build();

app.UseCors("AllowLocalhost");

app.MapPost("/generate-upload-url", async (
    HttpContext http,
    IAmazonS3 s3Client,
    IConfiguration config,
    UploadRequest request) =>
{
    var bucketName = config["R2:BucketName"];
    int expires = Int32.Parse(config["R2:Expires"]);

    AWSConfigsS3.UseSignatureVersion4 = true; 

    var key = Guid.NewGuid().ToString();
    string fileName = key;

    var requestUrl = new GetPreSignedUrlRequest
    {
        BucketName = bucketName,
        Key = key,
        Verb = HttpVerb.PUT,
        Expires = DateTime.UtcNow.AddMinutes(expires),
        ContentType = request.FileType
    };

    var url = s3Client.GetPreSignedURL(requestUrl);

    return Results.Ok(new { url, fileName });
});

app.Run();

record UploadRequest(string FileName, string FileType);
